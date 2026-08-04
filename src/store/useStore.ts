import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  personal: {
    name: string;
    age: string;
    biologicalSex: string;
    pregnancyStatus: string;
  };
  health: {
    conditions: string[];
    deficiencies: string[];
    familyHistory: string[];
  };
  allergies: {
    allergens: string[];
  };
  medications: string[];
  dietaryPreferences: string[];
  currentSupplements: string[];
  lifestyle: {
    smoking: string;
    alcohol: string;
    waterIntake: string;
    sleep: string;
  };
  fitness: {
    primaryGoal: string;
    activityLevel: string;
    exercise: string;
  };
  isProfileComplete: boolean;
}

export interface IngredientDetail {
  name: string;
  purpose: string;
  benefits: string[];
  suitableFor: string[];
  possibleRisks: string;
  safetyLevel: 'Green' | 'Yellow' | 'Red';
  status: 'Safe' | 'Caution' | 'Avoid';
  reason: string;
}

export interface AnalysisResult {
  id: string;
  date: string;
  productName: string;
  brand: string;
  productType: string;
  overallScore: number;
  subscores: {
    safety: number;
    effectiveness: number;
    allergyRisk: number;
    healthMatch: number;
  };
  aiExplanation: string;
  ingredients: IngredientDetail[];
  image: string; // base64
}

interface AppState {
  // Profile
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  
  // History
  history: AnalysisResult[];
  addHistory: (result: AnalysisResult) => void;
  updateResult: (id: string, updates: Partial<AnalysisResult>) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Settings
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  
  // Current Analysis (Transient)
  currentImages: string[];
  setCurrentImages: (images: string[]) => void;
  
  // App Reset
  resetApp: () => void;
}

const initialProfile: UserProfile = {
  personal: { name: '', age: '', biologicalSex: '', pregnancyStatus: '' },
  health: { conditions: [], deficiencies: [], familyHistory: [] },
  allergies: { allergens: [] },
  medications: [],
  dietaryPreferences: [],
  currentSupplements: [],
  lifestyle: { smoking: '', alcohol: '', waterIntake: '', sleep: '' },
  fitness: { primaryGoal: '', activityLevel: '', exercise: '' },
  isProfileComplete: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: initialProfile,
      setProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),
      
      history: [],
      addHistory: (result) => set((state) => ({ history: [result, ...state.history] })),
      updateResult: (id, updates) => set((state) => ({
        history: state.history.map(h => h.id === id ? { ...h, ...updates } : h)
      })),
      deleteHistory: (id) => set((state) => ({ history: state.history.filter(h => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
      
      geminiApiKey: '',
      setGeminiApiKey: (key) => set({ geminiApiKey: key, demoMode: !key }),
      demoMode: true,
      setDemoMode: (enabled) => set({ demoMode: enabled }),
      
      currentImages: [],
      setCurrentImages: (images) => set({ currentImages: images }),
      
      resetApp: () => set({ profile: initialProfile, history: [], geminiApiKey: '', demoMode: true, currentImages: [] }),
    }),
    {
      name: 'nutrisense-storage',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== 'currentImages')
      ) as AppState,
    }
  )
);
