import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { searchProducts, getProductById, compareProducts } from "@/lib/products";
import type { ProductFilters } from "@/types";

export const dynamic = "force-dynamic";

// Define the available tools for the model
const tools = {
  search_products: {
    name: "search_products",
    description: "Search for products in the e-commerce store with optional filters like category, price range, brand, etc.",
    parameters: {
      type: "object",
      properties: {
        search: { type: "string", description: "Search query for product name or description" },
        category: { type: "string", description: "Category slug to filter by. One of: furniture, home-decor, lighting, appliances, electronics, fashion, kitchen, bedding-bath" },
        minPrice: { type: "number", description: "Minimum price in INR" },
        maxPrice: { type: "number", description: "Maximum price in INR" },
        brands: { type: "string", description: "Comma-separated list of brand names" },
        colors: { type: "string", description: "Comma-separated list of colors" },
        materials: { type: "string", description: "Comma-separated list of materials" },
        minRating: { type: "number", description: "Minimum rating (1-5)" },
        sortBy: { type: "string", description: "Sort by: featured, price-asc, price-desc, rating, new" },
        limit: { type: "number", description: "Number of results to return (max 10)" }
      },
    },
  },
  get_product: {
    name: "get_product",
    description: "Get detailed information about a specific product by its ID",
    parameters: {
      type: "object",
      properties: {
        productId: { type: "string", description: "The ID of the product" }
      },
      required: ["productId"],
    },
  },
  compare_products: {
    name: "compare_products",
    description: "Compare multiple products by their IDs",
    parameters: {
      type: "object",
      properties: {
        productIds: { type: "string", description: "Comma-separated list of product IDs to compare" }
      },
      required: ["productIds"],
    },
  },
  add_to_cart: {
    name: "add_to_cart",
    description: "Add a product to the user's shopping cart. Call this when the user explicitly asks to buy or add an item to their cart.",
    parameters: {
      type: "object",
      properties: {
        productId: { type: "string", description: "The ID of the product to add" },
        quantity: { type: "number", description: "Quantity to add (default 1)" }
      },
      required: ["productId"],
    },
  }
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const model = getGeminiModel();

    // Map the internal history format to what Gemini expects in contents
    const contents = messages.map((msg: any) => {
      if (msg.role === "tool") {
        return {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: msg.toolName,
                response: msg.toolResult as object,
              },
            },
          ],
        };
      } else if (msg.role === "assistant") {
        return {
          role: "model",
          parts: msg.toolName
            ? [
                {
                  functionCall: {
                    name: msg.toolName,
                    args: (msg.toolResult as object) || {},
                  },
                },
              ]
            : [{ text: msg.content }],
        };
      } else {
        return {
          role: "user",
          parts: [{ text: msg.content }],
        };
      }
    });

    // Gemini strictly requires the first message to be from the 'user'
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          let response = await model.generateContentStream({
            contents,
            tools: [{ functionDeclarations: Object.values(tools) as any }],
          });

          let fullResponseText = "";
          let functionCallRequested = false;
          let fnToExecute: any = null;

          for await (const chunk of response.stream) {
            const functionCalls = chunk.functionCalls();
            
            if (functionCalls && functionCalls.length > 0) {
              functionCallRequested = true;
              fnToExecute = functionCalls[0];
            }
            
            try {
              const text = chunk.text();
              if (text) {
                fullResponseText += text;
                const textPayload = JSON.stringify({
                  type: "text",
                  text,
                });
                controller.enqueue(encoder.encode(`data: ${textPayload}\n\n`));
              }
            } catch (e) {}
          }

          if (fnToExecute) {
            const fn = fnToExecute;
            let fnResult: any;
            let productsData: any = null;

            try {
              if (fn.name === "search_products" || fn.name === "default_api:search_products") {
                const args = fn.args as Record<string, unknown>;
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
                productsData = searchResult.data;

              } else if (fn.name === "get_product" || fn.name === "default_api:get_product") {
                const productId = fn.args.productId as string;
                const product = await getProductById(productId);
                if (product) {
                  fnResult = { found: true, product };
                  productsData = [product];
                } else {
                  fnResult = { found: false, error: "Product not found" };
                }

              } else if (fn.name === "compare_products" || fn.name === "default_api:compare_products") {
                const idsStr = fn.args.productIds as string;
                const ids = idsStr.split(",").map(id => id.trim());
                const products = await compareProducts(ids);
                fnResult = { products };
                productsData = products;

              } else if (fn.name === "add_to_cart" || fn.name === "default_api:add_to_cart") {
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
                return;
              } else {
                fnResult = { error: `Unknown function ${fn.name}` };
              }
            } catch (err) {
              console.error(`Error executing tool ${fn.name}:`, err);
              fnResult = { error: "Failed to execute search" };
            }

            const toolPayload = JSON.stringify({
              type: "tool_result",
              toolName: fn.name,
              products: productsData,
            });
            controller.enqueue(encoder.encode(`data: ${toolPayload}\n\n`));

            // Append model's function call to contents array
            contents.push({
              role: "model",
              parts: [{
                functionCall: {
                  name: fn.name,
                  args: fn.args,
                }
              }]
            });
            
            // Append the tool result as a user message
            contents.push({
              role: "user",
              parts: [{
                functionResponse: {
                  name: fn.name,
                  response: fnResult as object
                }
              }]
            });

            // Call generateContentStream again with updated contents
            const nextResponse = await model.generateContentStream({
              contents,
              tools: [{ functionDeclarations: Object.values(tools) as any }],
            });

            for await (const nextChunk of nextResponse.stream) {
              try {
                const text = nextChunk.text();
                if (text) {
                  fullResponseText += text;
                  const textPayload = JSON.stringify({
                    type: "text",
                    text,
                  });
                  controller.enqueue(encoder.encode(`data: ${textPayload}\n\n`));
                }
              } catch (e) {}
            }
          }

          controller.enqueue(encoder.encode(`data: {"type":"finish"}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Chat API stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                text: "Sorry, I encountered an error while thinking. Please try again.",
              })}\n\n`
            )
          );
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
