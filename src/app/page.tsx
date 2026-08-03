import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Activity, Beaker, Leaf } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 flex items-center justify-center min-h-[85vh]">
        {/* Soft abstract background elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

        <div className="container px-4 md:px-6 relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-primary mb-8 bg-white/50 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Intelligence for your skincare
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
            Understand your <br className="hidden sm:inline" />
            products perfectly.
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            NutriSense provides personalized AI-assisted insights to help you avoid irritants, allergens, and harmful ingredients tailored exactly to your health profile.
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-x-6">
            <Link href="/setup" className={cn(buttonVariants({ size: "lg" }), "rounded-full h-14 px-8 text-base group")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Feature Section */}
      <section className="py-24 bg-white border-t border-border/50">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-background rounded-full mb-2">
                <Beaker className="h-6 w-6 text-primary stroke-[1.5]" />
              </div>
              <h3 className="font-heading text-xl font-medium">Extract</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamlessly read ingredients from any label using advanced vision models.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-background rounded-full mb-2">
                <Activity className="h-6 w-6 text-primary stroke-[1.5]" />
              </div>
              <h3 className="font-heading text-xl font-medium">Analyze</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cross-reference compounds with your unique health and skin profile.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-background rounded-full mb-2">
                <Sparkles className="h-6 w-6 text-primary stroke-[1.5]" />
              </div>
              <h3 className="font-heading text-xl font-medium">Inform</h3>
              <p className="text-muted-foreground leading-relaxed">
                Make confident, calm decisions about the products you consume.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
