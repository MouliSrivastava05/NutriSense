import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedIngredient {
  name: string;
  category: string;
}

export interface GeminiExtractionResult {
  product_name: string;
  brand: string;
  product_type: string;
  ingredients: ExtractedIngredient[];
  expiry_date: string | null;
}

const mockDemoData: GeminiExtractionResult = {
  product_name: "Ultra Repair Face Moisturizer",
  brand: "First Aid Beauty",
  product_type: "Moisturizer",
  ingredients: [
    { name: "Water", category: "Base" },
    { name: "Glycerin", category: "Humectant" },
    { name: "Caprylic/Capric Triglyceride", category: "Emollient" },
    { name: "Niacinamide", category: "Active" },
    { name: "Ceramide NP", category: "Skin-Identical Ingredient" },
    { name: "Phenoxyethanol", category: "Preservative" },
    { name: "Fragrance", category: "Fragrance" },
  ],
  expiry_date: "2025-12-01"
};

export async function analyzeProduct(
  base64Images: string[]
): Promise<GeminiExtractionResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY in environment variables.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
      Analyze these images of a skincare or cosmetic product.
      Extract the following information and return ONLY a strict JSON object with this exact structure:
      {
        "product_name": "string (empty if not found)",
        "brand": "string (empty if not found)",
        "product_type": "string (e.g., Serum, Moisturizer, Cleanser. empty if not found)",
        "ingredients": [
          { "name": "normalized ingredient name (e.g., Niacinamide instead of Vitamin B3)", "category": "category (e.g., Active, Preservative, Humectant, Fragrance)" }
        ],
        "expiry_date": "string (if visible, else null)"
      }
      
      Do not include markdown blocks like \`\`\`json. Return only the raw JSON text.
    `;

    // Convert data URLs to the format Gemini expects
    const imageParts = base64Images.map(base64 => {
      const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (!match) throw new Error("Invalid base64 string");
      return {
        inlineData: {
          data: match[2],
          mimeType: match[1]
        }
      };
    });

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting from the response
    const cleanedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    return JSON.parse(cleanedText) as GeminiExtractionResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to extract product information. Check API key and internet connection.");
  }
}
