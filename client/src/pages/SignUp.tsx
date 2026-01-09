import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      experienceLevel: "",
      agreeToUpdates: false,
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await apiRequest("POST", "/api/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        experienceLevel: data.experienceLevel,
        agreeToUpdates: data.agreeToUpdates,
      });
      const result = await response.json();
      return result;
    },
    onSuccess: (result) => {
      // Set session directly from signup response without additional HTTP request
      if (result.sessionId && result.user) {
        setSession(result.user, result.sessionId);
      }

      setSignupSuccess(true);

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setLocation("/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUpData) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent">
              Join the Waitlist
            </h1>
            <p className="text-lg text-muted-foreground">
              Be among the first to experience the future of intelligent crypto
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C7AE6A]">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        {...field}
                        data-testid="input-name"
                        className="bg-background border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C7AE6A]">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                        data-testid="input-email"
                        className="bg-background border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C7AE6A]">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          {...field}
                          data-testid="input-password"
                          className="bg-background border-border pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          data-testid="toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C7AE6A]">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          {...field}
                          data-testid="input-confirm-password"
                          className="bg-background border-border pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          data-testid="toggle-confirm-password"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C7AE6A]">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+61 xxx xxx xxx"
                        {...field}
                        data-testid="input-phone"
                        className="bg-background border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C7AE6A]">Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className="bg-background border-[#C7AE6A]"
                          data-testid="select-experience-level"
                        >
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new-to-crypto" data-testid="option-new-to-crypto">
                          I'm new to crypto
                        </SelectItem>
                        <SelectItem value="crypto-enthusiast" data-testid="option-crypto-enthusiast">
                          Crypto enthusiast
                        </SelectItem>
                        <SelectItem value="investor" data-testid="option-investor">
                          Investor / fund / family office
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-agree-updates"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-foreground">
                        I agree to receive updates from GOLDH
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C7AE6A] to-[#b99a45] hover:from-[#b99a45] hover:to-[#C7AE6A] text-black font-semibold"
                disabled={signUpMutation.isPending}
                data-testid="button-signup"
              >
                {signUpMutation.isPending ? "Joining..." : "Join the Waitlist"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline" data-testid="link-signin">
                  Sign In
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <AnimatePresence>
        {signupSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
            data-testid="signup-success-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-sm p-8 text-center space-y-6"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C7AE6A] to-[#F5E6C8] flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-black" />
                </motion.div>
                <Sparkles className="absolute -top-2 -right-2 text-[#C7AE6A] w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-[#C7AE6A]">Welcome to GOLDH!</h2>
                <p className="text-muted-foreground">
                  Your account has been created successfully.
                </p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecting to your dashboard in {countdown}s...
                </p>
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full bg-gradient-to-r from-[#C7AE6A] to-[#b99a45] text-black font-semibold"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
