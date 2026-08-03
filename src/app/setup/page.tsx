"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const profileSchema = z.object({
  name: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  biologicalSex: z.string().min(1, "Biological sex is required"),
  healthConditions: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.string().optional(),
  skinType: z.string().min(1, "Skin type is required"),
  skinConcerns: z.array(z.string()),
  smoking: z.string(),
  alcohol: z.string(),
  waterIntake: z.string(),
  sleep: z.string(),
  exercise: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const HEALTH_CONDITIONS = ["Diabetes", "Hypertension", "Kidney Disease", "Liver Disease", "Asthma", "Thyroid Disorders", "PCOS", "Heart Disease", "Rosacea", "Acne", "Psoriasis", "Eczema"];
const ALLERGIES = ["Fragrance", "Parabens", "Alcohol", "Sulfa", "Latex", "Nickel"];
const SKIN_CONCERNS = ["Acne", "Pigmentation", "Wrinkles", "Dark Spots", "Dryness", "Redness"];

export default function ProfilePage() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const { register, handleSubmit, control, trigger, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.personal.name || "",
      age: profile.personal.age || "",
      biologicalSex: profile.personal.biologicalSex || "",
      healthConditions: profile.health.conditions || [],
      allergies: profile.allergies.allergens || [],
      medications: profile.medications.join(", ") || "",
      skinType: profile.skin.type || "",
      skinConcerns: profile.skin.concerns || [],
      smoking: profile.lifestyle.smoking || "",
      alcohol: profile.lifestyle.alcohol || "",
      waterIntake: profile.lifestyle.waterIntake || "",
      sleep: profile.lifestyle.sleep || "",
      exercise: profile.lifestyle.exercise || "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["name", "age", "biologicalSex"];
    if (step === 2) fieldsToValidate = ["healthConditions", "allergies", "medications"];
    if (step === 3) fieldsToValidate = ["skinType", "skinConcerns"];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: ProfileFormValues) => {
    setProfile({
      personal: { name: data.name || "", age: data.age, biologicalSex: data.biologicalSex },
      health: { conditions: data.healthConditions },
      allergies: { allergens: data.allergies },
      medications: data.medications ? data.medications.split(",").map((m) => m.trim()) : [],
      skin: { type: data.skinType, concerns: data.skinConcerns },
      lifestyle: {
        smoking: data.smoking,
        alcohol: data.alcohol,
        waterIntake: data.waterIntake,
        sleep: data.sleep,
        exercise: data.exercise,
      },
      isProfileComplete: true,
    });
    toast.success("Profile saved successfully");
    router.push("/dashboard");
  };

  if (!mounted) return null;

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Health Profile</h1>
        <p className="text-muted-foreground mt-2">Complete your profile to receive personalized product compatibility insights.</p>
        <Progress value={(step / totalSteps) * 100} className="h-2 mt-4" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-medium">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic details to help us understand you better.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (Optional)</Label>
                      <Input id="name" {...register("name")} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" {...register("age")} placeholder="25" />
                      {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="biologicalSex">Biological Sex</Label>
                      <Controller
                        control={control}
                        name="biologicalSex"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.biologicalSex && <p className="text-sm text-destructive">{errors.biologicalSex.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Health & Allergies</CardTitle>
                  <CardDescription>Select any existing conditions or allergies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Medical Conditions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {HEALTH_CONDITIONS.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Controller
                            name="healthConditions"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`health-${condition}`}
                                checked={field.value.includes(condition)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, condition])
                                    : field.onChange(field.value.filter((val) => val !== condition));
                                }}
                              />
                            )}
                          />
                          <label htmlFor={`health-${condition}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {condition}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Allergies</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ALLERGIES.map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <Controller
                            name="allergies"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`allergy-${allergy}`}
                                checked={field.value.includes(allergy)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, allergy])
                                    : field.onChange(field.value.filter((val) => val !== allergy));
                                }}
                              />
                            )}
                          />
                          <label htmlFor={`allergy-${allergy}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {allergy}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications (Comma separated)</Label>
                    <Textarea id="medications" {...register("medications")} placeholder="e.g. Accutane, Metformin" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skin Profile</CardTitle>
                  <CardDescription>Tell us about your skin to evaluate cosmetic compatibility.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="skinType">Skin Type</Label>
                    <Controller
                      control={control}
                      name="skinType"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skin type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dry">Dry</SelectItem>
                            <SelectItem value="Oily">Oily</SelectItem>
                            <SelectItem value="Combination">Combination</SelectItem>
                            <SelectItem value="Sensitive">Sensitive</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.skinType && <p className="text-sm text-destructive">{errors.skinType.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label>Skin Concerns</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SKIN_CONCERNS.map((concern) => (
                        <div key={concern} className="flex items-center space-x-2">
                          <Controller
                            name="skinConcerns"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`skin-${concern}`}
                                checked={field.value.includes(concern)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, concern])
                                    : field.onChange(field.value.filter((val) => val !== concern));
                                }}
                              />
                            )}
                          />
                          <label htmlFor={`skin-${concern}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {concern}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Lifestyle</CardTitle>
                  <CardDescription>Lifestyle factors affect how your body reacts to products.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Smoking</Label>
                      <Controller
                        control={control}
                        name="smoking"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Never">Never</SelectItem>
                              <SelectItem value="Occasionally">Occasionally</SelectItem>
                              <SelectItem value="Regularly">Regularly</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alcohol Consumption</Label>
                      <Controller
                        control={control}
                        name="alcohol"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Never">Never</SelectItem>
                              <SelectItem value="Occasionally">Occasionally</SelectItem>
                              <SelectItem value="Regularly">Regularly</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Water Intake</Label>
                      <Controller
                        control={control}
                        name="waterIntake"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low (&lt; 1L/day)</SelectItem>
                              <SelectItem value="Medium">Medium (1-2L/day)</SelectItem>
                              <SelectItem value="High">High (&gt; 2L/day)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sleep</Label>
                      <Controller
                        control={control}
                        name="sleep"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Poor">Poor (&lt; 5 hours)</SelectItem>
                              <SelectItem value="Average">Average (5-7 hours)</SelectItem>
                              <SelectItem value="Good">Good (7+ hours)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exercise</Label>
                      <Controller
                        control={control}
                        name="exercise"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="1-2 times/week">1-2 times/week</SelectItem>
                              <SelectItem value="3+ times/week">3+ times/week</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {step < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit">
              Complete Profile <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
