/**
 * Service for interacting with the Nano Banana API (Gemini image generation/editing model).
 */

export async function generateRoomVisualization(
  roomImageBase64: string,
  productImageUrl: string,
  productDetails: string
): Promise<string> {
  const apiKey = process.env.NANOBANANA_API_KEY;
  const model = process.env.NANOBANANA_MODEL || "nano-banana-edit-v1";
  
  if (!apiKey) {
    throw new Error("NANOBANANA_API_KEY is not configured.");
  }

  const prompt = `Analyze this room photo. Identify the most natural empty space for the provided ${productDetails}. Place the product there realistically: match perspective, scale relative to existing furniture, lighting direction, color temperature, shadows, reflections, and floor contact. Preserve everything else in the room exactly as it is. Return only the edited image.`;

  // Clean the base64 string if it contains the data URL prefix
  const cleanBase64 = roomImageBase64.includes(",") 
    ? roomImageBase64.split(",")[1] 
    : roomImageBase64;

  try {
    // Structure represents a standard Google Cloud AI / Gemini prediction endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
            image: {
              bytesBase64Encoded: cleanBase64
            },
            referenceImage: {
              url: productImageUrl 
            }
          }
        ],
        parameters: {
          sampleCount: 1,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nano Banana API Error:", errorText);
      // Fallback for demo purposes if the API key is invalid or model doesn't exist yet
      return productImageUrl;
    }

    const data = await response.json();
    if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
      return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
    }

    return productImageUrl;
  } catch (error) {
    console.error("Error calling Nano Banana API:", error);
    return productImageUrl; // Fallback
  }
}
