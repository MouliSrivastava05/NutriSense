import { UserProfile, AnalysisResult, IngredientDetail } from "@/store/useStore";
import { GeminiExtractionResult } from "./gemini";

// Helper knowledge base for deterministic checks
const INGREDIENT_DB: Record<string, { purpose: string, benefits: string[], risks: string[], badFor: string[], goodFor: string[] }> = {
  "Niacinamide": {
    purpose: "Strengthens skin barrier",
    benefits: ["Oil control", "Brightening", "Reduces acne"],
    risks: ["High concentrations may cause mild redness"],
    badFor: [],
    goodFor: ["Acne", "Oily", "Hyperpigmentation"]
  },
  "Fragrance": {
    purpose: "Provides scent",
    benefits: ["Sensory experience"],
    risks: ["Contact dermatitis", "Irritation"],
    badFor: ["Sensitive", "Eczema", "Rosacea", "Fragrance"],
    goodFor: []
  },
  "Glycerin": {
    purpose: "Hydration",
    benefits: ["Draws moisture to skin"],
    risks: [],
    badFor: [],
    goodFor: ["Dry", "Dryness"]
  },
  "Ceramide NP": {
    purpose: "Skin barrier repair",
    benefits: ["Moisture retention", "Protection"],
    risks: [],
    badFor: [],
    goodFor: ["Dry", "Sensitive", "Eczema"]
  },
  "Phenoxyethanol": {
    purpose: "Preservative",
    benefits: ["Prevents bacterial growth"],
    risks: ["Can cause allergic reactions in rare cases"],
    badFor: [],
    goodFor: []
  }
};

export function checkCompatibility(
  extracted: GeminiExtractionResult, 
  profile: UserProfile
): AnalysisResult {
  let safetyScore = 100;
  let effectivenessScore = 100;
  let allergyScore = 100;
  let skinMatchScore = 100;

  const ingredientsDetails: IngredientDetail[] = extracted.ingredients.map(ing => {
    // Default fallback
    const dbInfo = INGREDIENT_DB[ing.name] || {
      purpose: ing.category,
      benefits: [],
      risks: [],
      badFor: [],
      goodFor: []
    };

    let status: "Safe" | "Caution" | "Avoid" = "Safe";
    let safetyLevel: "Green" | "Yellow" | "Red" = "Green";
    let reason = "Generally safe based on your profile.";
    
    // 1. Check Allergies
    const isAllergen = profile.allergies.allergens.some(a => 
      ing.name.toLowerCase().includes(a.toLowerCase()) || 
      ing.category.toLowerCase().includes(a.toLowerCase()) ||
      dbInfo.badFor.includes(a)
    );

    if (isAllergen) {
      status = "Avoid";
      safetyLevel = "Red";
      reason = "Contains an allergen specified in your profile.";
      allergyScore -= 30;
      safetyScore -= 20;
    } 
    // 2. Check Skin Type & Conditions Conflicts
    else {
      const conflicts = dbInfo.badFor.filter(b => 
        profile.skin.type === b || 
        profile.skin.concerns.includes(b) || 
        profile.health.conditions.includes(b)
      );

      if (conflicts.length > 0) {
        status = "Caution";
        safetyLevel = "Yellow";
        reason = `May irritate your ${conflicts[0]} condition.`;
        skinMatchScore -= 15;
      }
    }

    // Boost effectiveness for good matches
    const matches = dbInfo.goodFor.filter(g => 
      profile.skin.type === g || 
      profile.skin.concerns.includes(g)
    );
    if (matches.length > 0 && status !== "Avoid") {
      reason += ` Highly beneficial for your ${matches[0]}.`;
    } else if (matches.length === 0 && status === "Safe") {
      effectivenessScore -= 5;
    }

    return {
      name: ing.name,
      purpose: dbInfo.purpose,
      benefits: dbInfo.benefits,
      suitableFor: dbInfo.goodFor,
      possibleRisks: dbInfo.risks.join(", ") || "None known",
      safetyLevel,
      status,
      reason
    };
  });

  // Calculate overall score
  const avgSubscore = (safetyScore + effectivenessScore + allergyScore + skinMatchScore) / 4;
  const overallScore = Math.max(0, Math.min(100, Math.round(avgSubscore)));

  // Generate simple explanation
  let explanation = `Based on your profile, ${extracted.product_name} is `;
  if (overallScore > 80) {
    explanation += "an excellent match. ";
  } else if (overallScore > 50) {
    explanation += "generally suitable, but proceed with caution. ";
  } else {
    explanation += "not recommended. ";
  }

  const redFlags = ingredientsDetails.filter(i => i.status === "Avoid");
  if (redFlags.length > 0) {
    explanation += `You should avoid this product because it contains ${redFlags.map(r => r.name).join(", ")} which conflicts with your reported allergies.`;
  } else {
    const yellowFlags = ingredientsDetails.filter(i => i.status === "Caution");
    if (yellowFlags.length > 0) {
      explanation += `Take note that ingredients like ${yellowFlags[0].name} might cause mild irritation given your skin profile.`;
    } else {
      explanation += `The ingredients align well with your health and skin needs.`;
    }
  }

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    productName: extracted.product_name || "Unknown Product",
    brand: extracted.brand || "Unknown Brand",
    productType: extracted.product_type || "Cosmetic",
    overallScore,
    subscores: {
      safety: Math.max(0, safetyScore),
      effectiveness: Math.max(0, effectivenessScore),
      allergyRisk: Math.max(0, allergyScore),
      skinMatch: Math.max(0, skinMatchScore)
    },
    aiExplanation: explanation,
    ingredients: ingredientsDetails,
    image: "" // Handled in the component side if we want to save it
  };
}
