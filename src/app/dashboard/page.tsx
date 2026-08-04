"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Pencil, Check, X } from "lucide-react";
import { useStore, AnalysisResult } from "@/store/useStore";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

function DashboardItem({ product, idx }: { product: AnalysisResult, idx: number }) {
  const updateResult = useStore((state) => state.updateResult);
  const [isEditing, setIsEditing] = useState(false);
  const [editBrand, setEditBrand] = useState(product.brand);
  const [editName, setEditName] = useState(product.productName);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateResult(product.id, { brand: editBrand, productName: editName });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
    >
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-300">
        <div className="flex items-center gap-4 flex-1">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.productName} className="w-12 h-12 rounded-lg object-cover bg-secondary/30" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
              <span className="text-secondary-foreground text-xs font-medium">Img</span>
            </div>
          )}
          
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2 my-2 w-full max-w-sm" onClick={e => e.preventDefault()}>
                <Input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} placeholder="Brand" className="h-8 text-sm" />
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Product Name" className="h-8 text-sm" />
                <div className="flex gap-2 mt-1">
                  <Button size="sm" onClick={handleSave} className="h-7 text-xs px-2">
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 text-xs px-2">
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group/title relative inline-block pr-6">
                <h3 className="font-medium text-foreground">{product.productName}</h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <button 
                  onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                  className="absolute top-0 right-0 p-1 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity hover:text-primary"
                  title="Edit Product Info"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <Link href={`/results?id=${product.id}`} className="flex items-center gap-6 mt-4 sm:mt-0">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">Score: {product.overallScore}</div>
              <div className="text-xs text-muted-foreground">{new Date(product.date).toLocaleDateString()}</div>
            </div>
            <div className="p-2 bg-background rounded-full border group-hover:border-primary/50 transition-colors">
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

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
    ? Math.round(history.reduce((acc, curr) => acc + curr.subscores.healthMatch, 0) / history.length) 
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
              Your profile is optimized for your {profile.dietaryPreferences?.length ? profile.dietaryPreferences.join(", ").toLowerCase() : "balanced"} dietary preferences, 
              focusing on overall wellness and personal health compatibility.
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
                You have analyzed {history.length} products. Based on your unique health and dietary profile, your chosen products average a high safety score. Continue avoiding known allergens for the best results.
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
                  <span className="font-medium text-foreground">Health & Diet Match</span>
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
                <DashboardItem key={product.id} product={product} idx={idx} />
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
