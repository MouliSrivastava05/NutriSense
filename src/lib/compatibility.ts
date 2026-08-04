import { UserProfile, AnalysisResult, IngredientDetail } from "@/store/useStore";
import { GeminiExtractionResult } from "./gemini";

// Helper knowledge base for deterministic checks
const INGREDIENT_DB: Record<string, { purpose: string, benefits: string[], risks: string[], badFor: string[], goodFor: string[] }> = {
  "Whey Protein Isolate": {
    purpose: "Muscle recovery & growth",
    benefits: ["High protein content", "Fast absorption"],
    risks: ["Can cause digestive issues in lactose intolerant individuals"],
    badFor: ["Vegan", "Dairy-Free"],
    goodFor: ["Muscle Gain", "High Protein"]
  },
  "Peanuts": {
    purpose: "Energy and fat source",
    benefits: ["Healthy fats", "Protein"],
    risks: ["Severe allergen for some"],
    badFor: ["Nut Allergy"],
    goodFor: ["Keto", "High Energy"]
  },
  "Cane Sugar": {
    purpose: "Sweetener",
    benefits: ["Quick energy"],
    risks: ["Spikes blood sugar", "Contributes to weight gain"],
    badFor: ["Diabetes", "Keto"],
    goodFor: []
  },
  "Aspartame": {
    purpose: "Artificial Sweetener",
    benefits: ["Zero calories"],
    risks: ["May cause headaches in some individuals"],
    badFor: ["Clean Eating"],
    goodFor: ["Keto", "Diabetes"]
  },
  "Caffeine": {
    purpose: "Stimulant",
    benefits: ["Increases alertness", "Boosts metabolism"],
    risks: ["Can cause anxiety, jitteriness, or insomnia"],
    badFor: ["Heart Disease", "Hypertension", "Insomnia"],
    goodFor: ["Focus", "Pre-workout"]
  },
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
  "Ceramide NP": {
    purpose: "Skin barrier repair",
    benefits: ["Moisture retention", "Protection"],
    risks: [],
    badFor: [],
    goodFor: ["Dry", "Sensitive", "Eczema"]
  }
};

export function checkCompatibility(
  extracted: GeminiExtractionResult, 
  profile: UserProfile
): AnalysisResult {
  let safetyScore = 100;
  let effectivenessScore = 100;
  let allergyScore = 100;
  let healthMatchScore = 100;

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
    const isAllergen = profile.allergies.allergens.some(a => {
      // Normalize to catch singular forms of plural allergens (e.g. "Parabens" matches "Methylparaben")
      const searchStr = a.toLowerCase().endsWith('s') ? a.toLowerCase().slice(0, -1) : a.toLowerCase();
      
      return ing.name.toLowerCase().includes(searchStr) || 
             ing.category.toLowerCase().includes(searchStr) ||
             dbInfo.badFor.some(b => b.toLowerCase() === a.toLowerCase() || b.toLowerCase() === searchStr);
    });

    if (isAllergen) {
      status = "Avoid";
      safetyLevel = "Red";
      reason = "Contains an allergen specified in your profile.";
      allergyScore -= 30;
      safetyScore -= 20;
    } 
    // 2. Check Dietary & Health Conflicts
    else {
      const conflicts = dbInfo.badFor.filter(b => 
        profile.dietaryPreferences.some(pref => pref.toLowerCase() === b.toLowerCase()) || 
        profile.health.conditions.some(cond => cond.toLowerCase() === b.toLowerCase())
      );

      if (conflicts.length > 0) {
        status = "Caution";
        safetyLevel = "Yellow";
        reason = `May conflict with your ${conflicts[0]} requirement.`;
        healthMatchScore -= 15;
      }
    }

    // Boost effectiveness for good matches
    const matches = dbInfo.goodFor.filter(g => 
      profile.dietaryPreferences.some(pref => pref.toLowerCase() === g.toLowerCase()) || 
      profile.health.conditions.some(cond => cond.toLowerCase() === g.toLowerCase())
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
  const avgSubscore = (safetyScore + effectivenessScore + allergyScore + healthMatchScore) / 4;
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
      explanation += `Take note that ingredients like ${yellowFlags[0].name} might cause issues given your health profile.`;
    } else {
      explanation += `The ingredients align well with your dietary and health needs.`;
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
      healthMatch: Math.max(0, healthMatchScore)
    },
    aiExplanation: explanation,
    ingredients: ingredientsDetails,
    image: "" // Handled in the component side if we want to save it
  };
}
