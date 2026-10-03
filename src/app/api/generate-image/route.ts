import { NextRequest, NextResponse } from "next/server";
import { generateRoomVisualization } from "@/lib/nano-banana";

export const maxDuration = 60; // Allow up to 60s for image generation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomImageBase64, productImageUrl, productDetails } = body;

    if (!roomImageBase64 || !productImageUrl || !productDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.NANOBANANA_API_KEY) {
      // Return a simulated delay and the product image as a fallback if no key is present
      // so the UI can still be tested.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return NextResponse.json({
        success: true,
        generatedImageUrl: productImageUrl,
        isSimulated: true
      });
    }

    const generatedImageUrl = await generateRoomVisualization(
      roomImageBase64,
      productImageUrl,
      productDetails
    );

    return NextResponse.json({
      success: true,
      generatedImageUrl,
    });
  } catch (error) {
    console.error("Generate image API error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
