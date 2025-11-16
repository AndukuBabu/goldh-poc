import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect path from query params with security validation
  const getRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    
    if (!redirect) {
      return '/dashboard';
    }
    
    const decoded = decodeURIComponent(redirect);
    
    // Security: Only allow internal paths (must start with / but not //)
    // Prevents open redirect attacks
    if (!decoded.startsWith('/') || decoded.startsWith('//')) {
      console.warn('Invalid redirect path, defaulting to dashboard:', decoded);
      return '/dashboard';
    }
    
    return decoded;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signin(email, password);
      
      const redirectPath = getRedirectPath();
      
      toast({
        title: "Success!",
        description: "You've been signed in successfully.",
      });
      
      // Small delay to ensure auth state is updated before navigation
      setTimeout(() => {
        setLocation(redirectPath);
      }, 100);
    } catch (error: any) {
      // Clear any stale session on signin failure
      localStorage.removeItem("sessionId");
      
      // Provide user-friendly error messages
      let errorTitle = "Sign In Failed";
      let errorDescription = "Please check your credentials and try again.";
      
      if (error.message?.includes("401") || error.message?.includes("Invalid credentials")) {
        errorTitle = "Invalid Email or Password";
        errorDescription = "The email or password you entered is incorrect. Please try again.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorTitle = "Connection Error";
        errorDescription = "Unable to connect. Please check your internet connection.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your GOLDH dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email/Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-signin"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-semibold" data-testid="link-signup">
                  SIGN UP!
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
