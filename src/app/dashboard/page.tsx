"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { useStore } from "@/store/useStore";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const profile = useStore((state) => state.profile);
  const history = useStore((state) => state.history);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const recentHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  
  // Calculate averages
  const avgSafety = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.subscores.safety, 0) / history.length) 
    : 0;

  const avgMatch = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.subscores.skinMatch, 0) / history.length) 
    : 0;

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl tracking-tight mb-3">
              Hello{profile.personal.name ? `, ${profile.personal.name}` : ""}.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your profile is optimized for a {profile.skin.type?.toLowerCase() || "balanced"} skin type, 
              focusing on {profile.skin.concerns?.length ? profile.skin.concerns.join(" and ").toLowerCase() : "general wellness"}.
            </p>
          </div>
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "rounded-full whitespace-nowrap")}>
            <Plus className="mr-2 h-4 w-4" /> New Analysis
          </Link>
        </div>

        {/* Editorial Summary */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 border-b border-border/50 pb-16">
            <div className="md:col-span-5 flex flex-col justify-center">
              <h2 className="font-heading text-2xl mb-4">Your Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have analyzed {history.length} products. Based on your unique health and skin profile, your chosen products average a high safety score. Continue avoiding known allergens for the best results.
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7 flex flex-col justify-center space-y-8">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Average Safety Compatibility</span>
                  <span className="text-muted-foreground">{avgSafety}%</span>
                </div>
                <Progress value={avgSafety} className="h-1 bg-secondary/50" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Skin Type Match</span>
                  <span className="text-muted-foreground">{avgMatch}%</span>
                </div>
                <Progress value={avgMatch} className="h-1 bg-secondary/50" />
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl">Recent Analyses</h2>
            {history.length > 3 && (
              <Link href="/history" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                View all
              </Link>
            )}
          </div>

          {recentHistory.length > 0 ? (
            <div className="space-y-4">
              {recentHistory.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={`/results?id=${product.id}`}
                    className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.productName} className="w-12 h-12 rounded-lg object-cover bg-secondary/30" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
                          <span className="text-secondary-foreground text-xs font-medium">Img</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-foreground">{product.productName}</h3>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">Score: {product.overallScore}</div>
                        <div className="text-xs text-muted-foreground">{new Date(product.date).toLocaleDateString()}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border rounded-2xl bg-white">
              <p className="text-muted-foreground mb-6">No products analyzed yet.</p>
              <Link href="/upload" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                Start your first analysis
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
