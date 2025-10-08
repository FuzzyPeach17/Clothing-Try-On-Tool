import { GoogleGenAI, Modality } from "@google/genai";
import { UserMeasurements } from "../types";

// FIX: Removed unused generic parameter <T,> for cleaner code.
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// FIX: Removed unused generic parameter <T,> for cleaner code.
const urlToBas64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}. Please check the image URL and ensure it's directly accessible.`);
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
            throw new Error('The provided URL does not point to a valid image file.');
        }
        return blobToBase64(blob);
    } catch (error) {
        console.error("Error fetching or converting URL to Base64:", error);
        throw new Error("Could not load the clothing image from the URL. Please provide a direct link to an image file (e.g., ending in .jpg, .png).");
    }
};

export const generateVirtualTryOnImage = async (
  userImageBase64: string,
  clothingImageUrl: string,
  measurements: UserMeasurements
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const clothingImageBase64 = await urlToBas64(clothingImageUrl);

    const prompt = `You are an expert virtual stylist using advanced AI. A user has provided their photo, a photo of a piece of clothing, and their personal measurements.
    Your task is to generate a new, highly realistic image showing the user from the first image wearing the clothes from the second image.
    It is critical that you adjust the fit, drape, and appearance of the clothing to accurately match the user's specified measurements:
    - Weight: ${measurements.weight}
    - Height: ${measurements.height}
    - Bra Size: ${measurements.braSize}
    - Clothing Size: ${measurements.clothingSize}
    The final image should be photorealistic, maintaining the user's likeness, pose, and the background from their original photo, while seamlessly integrating the new clothing.
    Do not include any text or descriptions in your response, only the final image.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      // FIX: Reordered parts to put images first, followed by the text prompt, as per best practices for multimodal input. This helps the model correctly associate the prompt with the images.
      contents: {
        parts: [
          {
            inlineData: {
              data: userImageBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            inlineData: {
              data: clothingImageBase64,
              mimeType: 'image/jpeg', // Assuming JPG/PNG, model is robust to this.
            },
          },
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("The AI model did not return an image. Please try again.");
};
