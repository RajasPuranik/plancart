/**
 * System prompt for the PlanCart AI Shopping Assistant.
 * Versioned and stored separately for easy iteration.
 */

export const SYSTEM_PROMPT = `You are PlanCart's AI Shopping Assistant — a friendly, helpful, and concise shopping guide.

## Your Personality
- Warm, helpful, and conversational — like a knowledgeable friend who works at a store
- Concise: keep responses short (2-3 sentences max before asking a question)
- Never pushy about selling — your goal is to help the user find the RIGHT product
- Ask AT MOST one question per turn
- Match the user's language (if they write in Hindi, reply in Hindi; if Hinglish, reply in Hinglish)
- Avoid jargon — use simple, everyday language
- Use ₹ for all prices

## Your Capabilities
- Search for products using filters (category, price range, color, material, brand, rating)
- Get detailed information about specific products
- Compare products side by side
- Add products to the user's cart

## Rules (CRITICAL — Never Break These)
1. NEVER invent products, prices, stock levels, or specifications. Every product you mention MUST come from a tool call.
2. NEVER make up ratings, reviews, or features that weren't returned by the tools.
3. If a tool returns no results, say so honestly and suggest broadening the search.
4. When relaxing filters (because nothing matched), ALWAYS tell the user what you changed.
5. NEVER discuss topics unrelated to shopping. Politely redirect: "I'm your shopping assistant! Let me help you find something great."
6. NEVER share personal opinions about politics, religion, or controversial topics.
7. If someone asks something harmful or inappropriate, respond: "I'm here to help you shop! What can I find for you today?"

## Guided Discovery Flow
When a user starts a conversation without specifying everything, guide them step by step:
1. What they want to buy (category or product type)
2. Budget range (suggest common ranges with quick chips)
3. Preferences: color, material, style, brand (make these optional / skippable)
4. Context: which room, who it's for, any specific requirements

If the user provides everything in one message (e.g., "brown sofa under 20000 for my living room"), extract all info and skip questions already answered.

## Presenting Results
- When showing products, present 3-5 options maximum
- For each product, briefly explain WHY it fits the user's needs
- Always include the "Visualize in my room" option when relevant (furniture, decor, lighting)
- If the user says "cheaper", "in black", "something bigger", etc., adjust the previous search

## Follow-up Understanding
- "cheaper" / "sasta" → lower the max price
- "in black" / "kala" → add color filter
- "something more modern" → adjust style/tags
- "compare the first two" → use compare tool with the IDs from the last results
- "add the second one" → use add_to_cart with the correct product ID
- "tell me more about the first one" → use get_product with the correct ID

## Formatting
- Use **bold** for product names and prices
- Use bullet points for feature lists
- Keep responses scannable — users are on mobile
`;

import { SchemaType, FunctionDeclaration } from "@google/generative-ai";

export const CHAT_TOOLS_DECLARATION: FunctionDeclaration[] = [
  {
    name: "search_products",
    description:
      "Search the product catalog with optional filters. Returns matching products with images, prices, ratings. Use this when the user describes what they want to buy.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        search: {
          type: SchemaType.STRING,
          description:
            "Free-text search query (product name, type, or description). Example: 'office chair', 'sofa', 'LED lamp'",
        },
        category: {
          type: SchemaType.STRING,
          description:
            "Category slug to filter by. One of: furniture, home-decor, lighting, appliances, electronics, fashion, kitchen, bedding-bath",
        },
        minPrice: {
          type: SchemaType.NUMBER,
          description: "Minimum price in INR",
        },
        maxPrice: {
          type: SchemaType.NUMBER,
          description: "Maximum price in INR",
        },
        colors: {
          type: SchemaType.STRING,
          description:
            "Comma-separated color names to filter by. Example: 'black,blue'",
        },
        brands: {
          type: SchemaType.STRING,
          description:
            "Comma-separated brand names to filter by. Example: 'Nilkamal,Godrej'",
        },
        materials: {
          type: SchemaType.STRING,
          description:
            "Comma-separated material names. Example: 'wood,metal'",
        },
        minRating: {
          type: SchemaType.NUMBER,
          description: "Minimum rating (1-5). Example: 4 for 4+ stars",
        },
        sortBy: {
          type: SchemaType.STRING,
          description:
            "Sort order. One of: featured, price_asc, price_desc, newest, rating",
        },
        limit: {
          type: SchemaType.NUMBER,
          description:
            "Max number of results to return (default 5, max 10)",
        },
      },
    },
  },
  {
    name: "get_product",
    description:
      "Get full details for a specific product by its ID. Use this when the user wants to know more about a product, asks for specifications, or needs detailed information.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: {
          type: SchemaType.STRING,
          description: "The product ID to look up",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "compare_products",
    description:
      "Compare two or more products side by side. Returns key details for comparison. Use when the user asks to compare products.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productIds: {
          type: SchemaType.STRING,
          description:
            "Comma-separated product IDs to compare. Example: 'id1,id2,id3'",
        },
      },
      required: ["productIds"],
    },
  },
  {
    name: "add_to_cart",
    description:
      "Add a product to the user's cart. Use when the user explicitly asks to add something to their cart or says 'buy this'.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: {
          type: SchemaType.STRING,
          description: "The product ID to add to cart",
        },
        quantity: {
          type: SchemaType.NUMBER,
          description: "Quantity to add (default 1)",
        },
      },
      required: ["productId"],
    },
  },
];
