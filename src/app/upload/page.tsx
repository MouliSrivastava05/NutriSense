"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X, ArrowRight, Camera } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const router = useRouter();
  const setCurrentImages = useStore((state) => state.setCurrentImages);
  
  const [images, setImages] = useState<{ id: string; url: string; file: File }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const processFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith("image/"));
    
    if (validFiles.length === 0) {
      toast.error("Please upload image files only (JPG, PNG, HEIC)");
      return;
    }
    
    if (images.length + validFiles.length > 3) {
      toast.error("You can only upload up to 3 images (Front, Back, Label)");
      return;
    }
    
    const newImages = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };
  
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    try {
      // Convert all to base64
      const base64Images = await Promise.all(images.map(img => fileToBase64(img.file)));
      setCurrentImages(base64Images);
      router.push("/loading");
    } catch (error) {
      toast.error("Failed to process images");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col items-center text-center mb-10"
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Upload Product</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Upload clear images of the product. For best results, include the front, back, and the ingredient label.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="flex-1 w-full"
      >
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-colors duration-200 ease-in-out flex flex-col items-center justify-center min-h-[300px]
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            className="hidden" 
            accept="image/jpeg,image/png,image/heic" 
            multiple
          />
          
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <UploadCloud className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drag & Drop images here</h3>
          <p className="text-muted-foreground mb-6">Supports JPG, PNG, HEIC up to 10MB</p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
              <ImageIcon className="mr-2 h-4 w-4" /> Browse Files
            </Button>
            {/* On mobile, capture="environment" opens camera directly if we use it, but keeping it standard is safer for compatibility. */}
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Camera className="mr-2 h-4 w-4" /> Use Camera
            </Button>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
              Selected Images ({images.length}/3)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div 
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden border shadow-sm group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="Preview" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" className="rounded-full h-8 w-8" onClick={() => removeImage(img.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-center pb-12">
          <Button 
            size="lg" 
            className="rounded-full h-14 px-12 text-lg shadow-lg group"
            disabled={images.length === 0}
            onClick={handleAnalyze}
          >
            Analyze Ingredients
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
