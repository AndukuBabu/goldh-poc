import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Mail } from "lucide-react";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signin(email, password);
      
      toast({
        title: "Success!",
        description: "You've been signed in successfully.",
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      // Clear any stale session on signin failure
      localStorage.removeItem("sessionId");
      
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleMagicLink = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/magic-link", { email });
      const data = await res.json();
      
      if (data.isExistingUser) {
        toast({
          title: "Magic Link Sent!",
          description: data.message,
        });
      } else {
        toast({
          title: "Account Not Found",
          description: data.message,
          variant: "destructive",
        });
        setShowMagicLink(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request.",
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

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Magic Link */}
              {!showMagicLink ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowMagicLink(true)}
                  data-testid="button-show-magic-link"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Use Magic Link Instead
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleMagicLink}
                  disabled={isLoading}
                  data-testid="button-magic-link"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </Button>
              )}

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
