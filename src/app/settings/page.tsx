"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Key, Trash2, RotateCcw, Moon, Sun, Info } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const geminiApiKey = useStore((state) => state.geminiApiKey);
  const setGeminiApiKey = useStore((state) => state.setGeminiApiKey);
  const demoMode = useStore((state) => state.demoMode);
  const setDemoMode = useStore((state) => state.setDemoMode);
  
  const clearHistory = useStore((state) => state.clearHistory);
  const resetApp = useStore((state) => state.resetApp);
  
  const [mounted, setMounted] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);

  useEffect(() => {
    setMounted(true);
    setApiKeyInput(geminiApiKey);
  }, [geminiApiKey]);

  if (!mounted) return null;

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    if (apiKeyInput) {
      toast.success("API Key saved securely to your browser.");
      setDemoMode(false);
    } else {
      toast.success("API Key removed. Demo mode activated.");
      setDemoMode(true);
    }
  };

  const handleResetApp = () => {
    if (window.confirm("Are you sure you want to reset the entire application? This will delete your profile, history, and settings.")) {
      resetApp();
      toast.success("Application reset successfully.");
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your application preferences and data.</p>
      </div>

      <div className="space-y-6">
        {/* API Key Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-muted-foreground" /> Gemini API Integration
              </CardTitle>
              <CardDescription>
                Provide your Gemini API key to enable live AI analysis. Without a key, the app runs in Demo Mode with mock data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="space-y-0.5">
                  <Label>Demo Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    {demoMode ? "Enabled. Using mock product data." : "Disabled. Using live Gemini API."}
                  </p>
                </div>
                <Switch 
                  checked={demoMode} 
                  onCheckedChange={(checked) => {
                    setDemoMode(checked);
                    if (checked) toast.info("Demo Mode activated");
                    else if (!geminiApiKey) {
                      toast.error("Please enter an API key first");
                      setDemoMode(true);
                    }
                  }} 
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="api-key">API Key (Stored only in your browser)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="api-key" 
                    type="password" 
                    placeholder="AIzaSy..." 
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <Button onClick={handleSaveApiKey}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-muted-foreground" /> Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of NutriSense.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred theme.</p>
                </div>
                <div className="flex items-center gap-2 border rounded-full p-1 bg-muted/20">
                  <Button 
                    variant={theme === "light" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="rounded-full h-8"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-2" /> Light
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="rounded-full h-8"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4 mr-2" /> Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Data Management
              </CardTitle>
              <CardDescription>Manage or clear your local application data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <p className="font-medium">Clear History</p>
                  <p className="text-sm text-muted-foreground">Delete all your scanned products.</p>
                </div>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => {
                  if (window.confirm("Clear all history?")) clearHistory();
                }}>
                  Clear
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="space-y-0.5">
                  <p className="font-medium text-destructive">Reset Application</p>
                  <p className="text-sm text-muted-foreground">Delete profile, settings, and all data.</p>
                </div>
                <Button variant="destructive" onClick={handleResetApp}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> About NutriSense
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>NutriSense MVP / Demo Application.</p>
              <p><strong>Privacy:</strong> All personal data, health conditions, and history are stored securely in your browser&apos;s local storage. We do not use a backend database. Images uploaded are processed through the Gemini API but not stored on our servers.</p>
              <p><strong>Disclaimer:</strong> Information provided by NutriSense is AI-generated and for informational purposes only. It does not constitute medical advice.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
