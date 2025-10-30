import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Wallet, Mail, Sparkles } from "lucide-react";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signin, connectWallet } = useAuth();
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
      toast({
        title: "Error",
        description: error.message || "Failed to sign in or create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signin(email, password);
      
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
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
      await res.json();
      
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for the sign-in link.",
      });
      
      console.log("Magic link sent to:", email);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        
        const mockBalance = Math.floor(Math.random() * 10000);
        
        try {
          await connectWallet(walletAddress, mockBalance);
          
          toast({
            title: "Wallet Connected!",
            description: mockBalance >= 5000 
              ? `Premium status activated! Balance: ${mockBalance} GOLDH` 
              : `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
          });
        } catch (err) {
          console.log("Not logged in, just showing wallet connection");
          toast({
            title: "Wallet Connected!",
            description: `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
          });
        }
        
        setLocation("/dashboard");
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. You can continue without it.",
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
                  {isLoading ? "Processing..." : "Sign In / Sign Up"}
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

              {/* Wallet Connection */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Optional</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full border-primary/30"
                  onClick={handleWalletConnect}
                  disabled={isLoading}
                  data-testid="button-wallet-connect"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect MetaMask Wallet
                </Button>

                <div className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Connect your wallet to unlock Premium features. Users with 5000+ GOLDH tokens get exclusive benefits!
                  </p>
                </div>
              </div>

              {/* Skip Option */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-skip-wallet"
              >
                Continue without wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
