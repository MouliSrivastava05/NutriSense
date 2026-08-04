"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  name: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  biologicalSex: z.string().min(1, "Biological sex is required"),
  pregnancyStatus: z.string(),
  healthConditions: z.array(z.string()),
  deficiencies: z.array(z.string()),
  familyHistory: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.string().optional(),
  dietaryPreferences: z.array(z.string()),
  currentSupplements: z.array(z.string()),
  smoking: z.string(),
  alcohol: z.string(),
  waterIntake: z.string(),
  sleep: z.string(),
  primaryGoal: z.string(),
  activityLevel: z.string(),
  exercise: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const HEALTH_CONDITIONS = ["Diabetes", "Hypertension", "Kidney Disease", "Liver Disease", "Asthma", "Thyroid Disorders", "PCOS", "Heart Disease", "Rosacea", "Acne", "Psoriasis", "Eczema"];
const DEFICIENCIES = ["Iron", "Vitamin D", "Vitamin B12", "Magnesium", "Calcium", "Zinc", "Omega-3"];
const FAMILY_HISTORY = ["Heart Disease", "Diabetes", "Hypertension", "Cancer", "Alzheimer's"];
const ALLERGIES = ["Fragrance", "Parabens", "Alcohol", "Sulfa", "Latex", "Nickel", "Peanuts", "Dairy", "Gluten", "Soy", "Eggs", "Tree Nuts"];
const DIETARY_PREFERENCES = ["Vegan", "Vegetarian", "Pescatarian", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Halal", "Kosher"];
const SUPPLEMENTS = ["Multivitamin", "Whey Protein", "Fish Oil", "Probiotics", "Creatine", "Vitamin D", "Iron", "Magnesium", "B-Complex", "Collagen"];

export default function EditProfilePage() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const [mounted, setMounted] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.personal?.name || "",
      age: profile.personal?.age || "",
      biologicalSex: profile.personal?.biologicalSex || "",
      pregnancyStatus: profile.personal?.pregnancyStatus || "",
      healthConditions: profile.health?.conditions || [],
      deficiencies: profile.health?.deficiencies || [],
      familyHistory: profile.health?.familyHistory || [],
      allergies: profile.allergies?.allergens || [],
      medications: profile.medications?.join(", ") || "",
      dietaryPreferences: profile.dietaryPreferences || [],
      currentSupplements: profile.currentSupplements || [],
      smoking: profile.lifestyle?.smoking || "",
      alcohol: profile.lifestyle?.alcohol || "",
      waterIntake: profile.lifestyle?.waterIntake || "",
      sleep: profile.lifestyle?.sleep || "",
      primaryGoal: profile.fitness?.primaryGoal || "",
      activityLevel: profile.fitness?.activityLevel || "",
      exercise: profile.fitness?.exercise || "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: ProfileFormValues) => {
    setProfile({
      personal: { name: data.name || "", age: data.age, biologicalSex: data.biologicalSex, pregnancyStatus: data.pregnancyStatus },
      health: { conditions: data.healthConditions, deficiencies: data.deficiencies, familyHistory: data.familyHistory },
      allergies: { allergens: data.allergies },
      medications: data.medications ? data.medications.split(",").map((m) => m.trim()) : [],
      dietaryPreferences: data.dietaryPreferences,
      currentSupplements: data.currentSupplements,
      lifestyle: {
        smoking: data.smoking,
        alcohol: data.alcohol,
        waterIntake: data.waterIntake,
        sleep: data.sleep,
      },
      fitness: {
        primaryGoal: data.primaryGoal,
        activityLevel: data.activityLevel,
        exercise: data.exercise,
      },
      isProfileComplete: true,
    });
    toast.success("Profile saved successfully");
    router.push("/dashboard");
  };

  if (!mounted) return null;

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Your Health Profile</h1>
          <p className="text-muted-foreground mt-2">Update your profile to ensure your insights are accurate.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details to help us understand you better.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="pregnancyStatus">Pregnancy / Nursing Status</Label>
                  <Controller
                    control={control}
                    name="pregnancyStatus"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                          <SelectItem value="Pregnant">Pregnant</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health & Allergies</CardTitle>
              <CardDescription>Select any existing conditions or allergies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Medical Conditions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

              <div className="space-y-3">
                <Label>Known Nutritional Deficiencies</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {DEFICIENCIES.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Controller
                        name="deficiencies"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`def-${item}`}
                            checked={field.value.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item])
                                : field.onChange(field.value.filter((val) => val !== item));
                            }}
                          />
                        )}
                      />
                      <label htmlFor={`def-${item}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Family Medical History</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {FAMILY_HISTORY.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Controller
                        name="familyHistory"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`fam-${item}`}
                            checked={field.value.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item])
                                : field.onChange(field.value.filter((val) => val !== item));
                            }}
                          />
                        )}
                      />
                      <label htmlFor={`fam-${item}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {item}
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

          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>Tell us about your diet to evaluate food and supplement compatibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Dietary Choices</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_PREFERENCES.map((pref) => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Controller
                        name="dietaryPreferences"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`diet-${pref}`}
                            checked={field.value.includes(pref)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, pref])
                                : field.onChange(field.value.filter((val) => val !== pref));
                            }}
                          />
                        )}
                      />
                      <label htmlFor={`diet-${pref}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {pref}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <Label>Current Supplements Taken</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SUPPLEMENTS.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Controller
                        name="currentSupplements"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`supp-${item}`}
                            checked={field.value.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item])
                                : field.onChange(field.value.filter((val) => val !== item));
                            }}
                          />
                        )}
                      />
                      <label htmlFor={`supp-${item}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fitness & Goals</CardTitle>
              <CardDescription>Tell us about your fitness routines and primary objectives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Health Goal</Label>
                  <Controller
                    control={control}
                    name="primaryGoal"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                          <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Better Sleep">Better Sleep</SelectItem>
                          <SelectItem value="Energy Boost">Energy Boost</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Activity Level</Label>
                  <Controller
                    control={control}
                    name="activityLevel"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sedentary">Sedentary</SelectItem>
                          <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                          <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                          <SelectItem value="Very Active">Very Active</SelectItem>
                          <SelectItem value="Athlete">Athlete</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exercise Frequency</Label>
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

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="px-8 rounded-full">Save Changes</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
