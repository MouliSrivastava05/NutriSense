"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { analyzeProduct } from "@/lib/gemini";
import { checkCompatibility } from "@/lib/compatibility";

const loadingStages = [
  "Scanning product...",
  "Reading ingredients...",
  "Analyzing compatibility...",
  "Generating AI explanation..."
];

export default function LoadingPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const currentImages = useStore((state) => state.currentImages);
  const profile = useStore((state) => state.profile);
  const addHistory = useStore((state) => state.addHistory);
  const geminiApiKey = useStore((state) => state.geminiApiKey);
  const demoMode = useStore((state) => state.demoMode);

  useEffect(() => {
    if (currentImages.length === 0) {
      router.replace("/upload");
      return;
    }

    let isMounted = true;

    // Simulate progressive loading text
    const stageInterval = setInterval(() => {
      setStage((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 1500);

    const performAnalysis = async () => {
      try {
        // 1. Image understanding & Ingredient extraction via Gemini (or Demo Data)
        const geminiResult = await analyzeProduct(currentImages, geminiApiKey, demoMode);
        
        // 2. Compatibility Engine check
        const compatibilityResult = checkCompatibility(geminiResult, profile);
        
        if (isMounted) {
          addHistory(compatibilityResult);
          router.push(`/results?id=${compatibilityResult.id}`);
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        toast.error("Failed to analyze product. Please try again.");
        if (isMounted) {
          router.push("/upload");
        }
      } finally {
        clearInterval(stageInterval);
      }
    };

    // Small delay to let the animation start
    const timeout = setTimeout(() => {
      performAnalysis();
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(stageInterval);
      clearTimeout(timeout);
    };
  }, [currentImages, profile, addHistory, router, geminiApiKey, demoMode]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20 mb-8"
      >
        <Leaf className="h-10 w-10 text-white" />
      </motion.div>

      <div className="h-12 flex items-center justify-center">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xl font-medium text-foreground"
        >
          {loadingStages[stage]}
        </motion.p>
      </div>

      <div className="mt-8 w-64 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </div>
    </div>
  );
}
