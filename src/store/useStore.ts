import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  personal: {
    name: string;
    age: string;
    biologicalSex: string;
  };
  health: {
    conditions: string[];
  };
  allergies: {
    allergens: string[];
  };
  medications: string[];
  skin: {
    type: string;
    concerns: string[];
  };
  lifestyle: {
    smoking: string;
    alcohol: string;
    waterIntake: string;
    sleep: string;
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
    skinMatch: number;
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
  personal: { name: '', age: '', biologicalSex: '' },
  health: { conditions: [] },
  allergies: { allergens: [] },
  medications: [],
  skin: { type: '', concerns: [] },
  lifestyle: { smoking: '', alcohol: '', waterIntake: '', sleep: '', exercise: '' },
  isProfileComplete: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: initialProfile,
      setProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),
      
      history: [],
      addHistory: (result) => set((state) => ({ history: [result, ...state.history] })),
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
    }
  )
);
