"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function HistoryPage() {
  const history = useStore((state) => state.history);
  const deleteHistory = useStore((state) => state.deleteHistory);
  const clearHistory = useStore((state) => state.clearHistory);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire analysis history?")) {
      clearHistory();
      toast.success("History cleared");
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-border/50 pb-12">
        <div className="max-w-xl">
          <h1 className="font-heading text-4xl tracking-tight mb-4">
            Analysis Journal
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A chronological record of the products you have evaluated against your health profile.
          </p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-sm font-medium text-destructive hover:underline underline-offset-4"
          >
            Clear Journal
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-12">
          {history.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex flex-col sm:flex-row gap-8 items-start group">
                <div className="shrink-0 w-24 sm:w-32">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    {new Date(product.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.productName} className="w-full aspect-square object-cover bg-secondary/30 grayscale hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full aspect-square bg-secondary/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-secondary-foreground uppercase tracking-widest">Image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</span>
                      <h2 className="font-heading text-2xl mt-1 mb-3 truncate">{product.productName}</h2>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-2xl">{product.overallScore}</span>
                      <span className="block text-xs uppercase tracking-widest text-muted-foreground">Score</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                    {product.aiExplanation}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Link href={`/results?id=${product.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full px-6")}>
                      Read Analysis
                    </Link>
                    <button 
                      onClick={() => deleteHistory(product.id)}
                      className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              
              {idx < history.length - 1 && <div className="mt-12 h-px w-full bg-border/50" />}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-lg text-muted-foreground mb-8">Your journal is currently empty.</p>
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "rounded-full h-14 px-8 text-base")}>
            Start your first analysis <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
