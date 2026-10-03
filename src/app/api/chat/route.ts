import { NextRequest, NextResponse } from "next/server";
import { genAI, modelName } from "@/lib/gemini";
import { SYSTEM_PROMPT, CHAT_TOOLS_DECLARATION } from "@/lib/ai/system-prompt";
import { searchProducts, getProductById, compareProducts } from "@/lib/products";
import type { ChatMessage, ProductFilters } from "@/types";
import { v4 as uuidv4 } from "uuid";

// We'll stream the response back using standard Response streams
export const maxDuration = 60; // Vercel edge function max duration

// Parse and validate incoming messages
interface ChatRequestBody {
  messages: ChatMessage[];
  sessionId?: string;
  language?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, sessionId = uuidv4(), language = "en" } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Convert our generic chat history to Gemini's format
    const history = messages
      .slice(0, -1) // Exclude the latest message
      .map((msg) => ({
        role: msg.role === "assistant" || msg.role === "tool" ? "model" : "user",
        parts: [
          // If it was a tool result, format it properly
          msg.role === "tool" && msg.toolName && msg.toolResult
            ? {
                functionResponse: {
                  name: msg.toolName,
                  response: msg.toolResult as object,
                },
              }
            : // If it was a tool call by the model
            msg.role === "assistant" && msg.toolName
            ? {
                functionCall: {
                  name: msg.toolName,
                  args: (msg.toolResult as object) || {},
                },
              }
            : // Regular text message
              { text: msg.content },
        ],
      }));

    // Gemini strictly requires the first message in history to be from the 'user'
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const latestMessage = messages[messages.length - 1];

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT + `\n\nUser's preferred language: ${language}`,
      tools: [{ functionDeclarations: CHAT_TOOLS_DECLARATION }],
    });

    // Start a chat session
    const chat = model.startChat({
      history,
    });

    // The stream to send to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // If the latest message was a tool result from the client (e.g. add_to_cart success)
          let response;
          if (latestMessage.role === "tool" && latestMessage.toolName) {
            response = await chat.sendMessageStream([
              {
                functionResponse: {
                  name: latestMessage.toolName,
                  response: (latestMessage.toolResult as object) || { status: "success" },
                },
              },
            ]);
          } else {
            // Normal user message
            response = await chat.sendMessageStream(latestMessage.content);
          }

          let fullResponseText = "";
          let functionCallRequested = false;

          for await (const chunk of response as any) {
            // Check for function calls
            const functionCalls = chunk.functionCalls();
            
            if (functionCalls && functionCalls.length > 0) {
              functionCallRequested = true;
              const fn = functionCalls[0];
              
              // We'll execute the function on the server side and continue the chat
              let fnResult;
              let productsData = null;

              try {
                if (fn.name === "search_products") {
                  const args = fn.args as Record<string, unknown>;
                  
                  // Convert args to ProductFilters
                  const filters: ProductFilters = {
                    search: args.search as string,
                    category: args.category as string,
                    minPrice: args.minPrice as number,
                    maxPrice: args.maxPrice as number,
                    sortBy: (args.sortBy as ProductFilters["sortBy"]) || "featured",
                    limit: Math.min((args.limit as number) || 5, 10),
                  };

                  if (args.colors && typeof args.colors === "string") {
                    filters.colors = args.colors.split(",").map(c => c.trim());
                  }
                  if (args.brands && typeof args.brands === "string") {
                    filters.brands = args.brands.split(",").map(b => b.trim());
                  }
                  if (args.materials && typeof args.materials === "string") {
                    filters.materials = args.materials.split(",").map(m => m.trim());
                  }
                  if (args.minRating) {
                    filters.minRating = Number(args.minRating);
                  }

                  const searchResult = await searchProducts(filters);
                  fnResult = {
                    totalFound: searchResult.pagination.total,
                    products: searchResult.data.map(p => ({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      mrp: p.mrp,
                      discount: p.discount,
                      rating: p.rating,
                      brand: p.brand,
                      shortDescription: p.shortDescription,
                      stock: p.stock
                    }))
                  };
                  // We'll pass full product data to the UI to render cards
                  productsData = searchResult.data;

                } else if (fn.name === "get_product") {
                  const productId = fn.args.productId as string;
                  const product = await getProductById(productId);
                  if (product) {
                    fnResult = { found: true, product };
                    // Add this single product to UI data so it can be rendered
                    productsData = [product];
                  } else {
                    fnResult = { found: false, error: "Product not found" };
                  }

                } else if (fn.name === "compare_products") {
                  const idsStr = fn.args.productIds as string;
                  const ids = idsStr.split(",").map(id => id.trim());
                  const products = await compareProducts(ids);
                  fnResult = { products };
                  productsData = products;

                } else if (fn.name === "add_to_cart") {
                  // For add_to_cart, we send an instruction to the client UI to actually add it
                  // because cart state is managed client-side in Zustand
                  const productId = fn.args.productId as string;
                  const product = await getProductById(productId);
                  const payload = JSON.stringify({
                    type: "tool_call",
                    toolName: fn.name,
                    args: fn.args,
                    product: product,
                  });
                  controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                  controller.enqueue(encoder.encode(`data: {"type":"finish"}\n\n`));
                  controller.close();
                  return; // End here, the client will send the tool response back
                } else {
                  fnResult = { error: `Unknown function ${fn.name}` };
                }
              } catch (err) {
                console.error(`Error executing tool ${fn.name}:`, err);
                fnResult = { error: "Failed to execute search" };
              }

              // Send the tool call and result to the client so UI can render products
              const toolPayload = JSON.stringify({
                type: "tool_result",
                toolName: fn.name,
                products: productsData, // Send full product data for UI rendering
              });
              controller.enqueue(encoder.encode(`data: ${toolPayload}\n\n`));

              // Continue the chat with the function response
              const nextResponse = await chat.sendMessageStream([{
                functionResponse: {
                  name: fn.name,
                  response: fnResult as object
                }
              }]);

              for await (const nextChunk of nextResponse as any) {
                const text = nextChunk.text();
                if (text) {
                  fullResponseText += text;
                  const textPayload = JSON.stringify({
                    type: "text",
                    text,
                  });
                  controller.enqueue(encoder.encode(`data: ${textPayload}\n\n`));
                }
              }
            } else {
              // Standard text chunk
              const text = chunk.text();
              if (text) {
                fullResponseText += text;
                const textPayload = JSON.stringify({
                  type: "text",
                  text,
                });
                controller.enqueue(encoder.encode(`data: ${textPayload}\n\n`));
              }
            }
          }

          // Send finish signal
          const finishPayload = JSON.stringify({ type: "finish" });
          controller.enqueue(encoder.encode(`data: ${finishPayload}\n\n`));
          controller.close();

        } catch (error) {
          console.error("Chat API stream error:", error);
          const errorPayload = JSON.stringify({
            type: "error",
            text: "Sorry, I encountered an error while thinking. Please try again.",
          });
          controller.enqueue(encoder.encode(`data: ${errorPayload}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
