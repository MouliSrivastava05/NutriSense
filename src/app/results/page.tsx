"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-border" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          className="text-primary"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-heading text-6xl font-light text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}

function StatusDot({ level }: { level: string }) {
  let colorClass = "bg-primary";
  if (level === "Yellow") colorClass = "bg-warning";
  if (level === "Red") colorClass = "bg-destructive";
  
  return <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} />;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const history = useStore((state) => state.history);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const result = history.find(h => h.id === id);

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <h2 className="font-heading text-2xl mb-4">Result not found</h2>
        <Link href="/dashboard" className={buttonVariants()}>Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <button onClick={() => router.back()} className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
        
        {/* Left Column: Overview */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">{result.brand}</p>
          <h1 className="font-heading text-3xl sm:text-4xl leading-tight mb-12">{result.productName}</h1>
          
          <div className="mb-12 flex justify-center w-full lg:justify-start">
            <ScoreRing score={result.overallScore} />
          </div>
          
          <div className="w-full space-y-6 max-w-sm">
            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider mb-2">
                <span className="text-muted-foreground">Safety</span>
                <span>{result.subscores.safety}%</span>
              </div>
              <Progress value={result.subscores.safety} className="h-[2px] bg-border" />
            </div>
            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider mb-2">
                <span className="text-muted-foreground">Effectiveness</span>
                <span>{result.subscores.effectiveness}%</span>
              </div>
              <Progress value={result.subscores.effectiveness} className="h-[2px] bg-border" />
            </div>
            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider mb-2">
                <span className="text-muted-foreground">Allergen Free</span>
                <span>{result.subscores.allergyRisk}%</span>
              </div>
              <Progress value={result.subscores.allergyRisk} className="h-[2px] bg-border" />
            </div>
            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider mb-2">
                <span className="text-muted-foreground">Skin Match</span>
                <span>{result.subscores.skinMatch}%</span>
              </div>
              <Progress value={result.subscores.skinMatch} className="h-[2px] bg-border" />
            </div>
          </div>
        </div>

        {/* Right Column: Details & Ingredients */}
        <div className="lg:col-span-6 lg:col-start-7 space-y-12">
          
          {/* AI Explanation */}
          <section>
            <h2 className="font-heading text-lg font-medium mb-4">Analysis Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              {result.aiExplanation}
            </p>
          </section>
          
          {/* Ingredients */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-medium">Ingredients Breakdown</h2>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">{result.ingredients.length} Items</span>
            </div>
            
            <div className="space-y-4 border-t border-border pt-4">
              {result.ingredients.map((ing, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1 + (idx * 0.05) }}
                >
                  <Collapsible className="group">
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-3 text-left">
                      <div className="flex items-center gap-3">
                        <StatusDot level={ing.safetyLevel} />
                        <span className="font-medium text-foreground">{ing.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="text-sm hidden sm:inline-block">{ing.purpose}</span>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="pb-6 pt-2 pl-5 space-y-4 text-sm">
                        <p className="text-muted-foreground leading-relaxed">{ing.reason}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ing.benefits && ing.benefits.length > 0 && (
                            <div>
                              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Benefits</span>
                              <span className="text-foreground">{ing.benefits.join(", ")}</span>
                            </div>
                          )}
                          
                          {ing.suitableFor && ing.suitableFor.length > 0 && (
                            <div>
                              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Suitable For</span>
                              <span className="text-foreground">{ing.suitableFor.join(", ")}</span>
                            </div>
                          )}
                          
                          {ing.possibleRisks && ing.possibleRisks !== "None known" && (
                            <div className="sm:col-span-2">
                              <span className="block text-xs uppercase tracking-wider text-destructive mb-1">Possible Risks</span>
                              <span className="text-foreground">{ing.possibleRisks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  {idx < result.ingredients.length - 1 && <div className="h-px bg-border/50" />}
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
