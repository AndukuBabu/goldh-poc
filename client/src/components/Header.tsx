import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { User, LogOut, Shield } from "lucide-react";
import logoImage from "@assets/goldh-logo.svg";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, signout, isLoading } = useAuth();
  
  const isActive = (path: string) => {
    if (path === "/features") {
      return location === path || location.startsWith("/features/");
    }
    return location === path;
  };

  const handleSignOut = async () => {
    await signout();
    setLocation("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 hover-elevate cursor-pointer px-3 py-2 rounded-md transition-all">
            <img 
              src={logoImage} 
              alt="GOLDH Logo" 
              className="h-12 md:h-14 lg:h-16 w-auto" 
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/features">
            <Button 
              variant={isActive("/features") ? "default" : "ghost"} 
              data-testid="button-nav-features" 
              className={isActive("/features") ? "" : "text-foreground"}
            >
              Features
            </Button>
          </Link>
          <Link href="/learn">
            <Button 
              variant={isActive("/learn") ? "default" : "ghost"} 
              data-testid="button-nav-learn" 
              className={isActive("/learn") ? "" : "text-foreground"}
            >
              Learn
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              variant={isActive("/dashboard") ? "default" : "ghost"} 
              data-testid="button-nav-dashboard" 
              className={isActive("/dashboard") ? "" : "text-foreground"}
            >
              Dashboard
            </Button>
          </Link>
          {isLoading ? (
            <div className="w-24 h-9 bg-muted/50 rounded-md animate-pulse" />
          ) : user ? (
            <>
              <Link href="/profile">
                <Button 
                  variant={isActive("/profile") ? "default" : "ghost"} 
                  data-testid="button-nav-profile"
                  className={isActive("/profile") ? "" : "text-foreground"}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {user.isAdmin && (
                <Link href="/admin/guru-digest">
                  <Button 
                    variant={isActive("/admin/guru-digest") ? "default" : "ghost"} 
                    data-testid="button-nav-admin"
                    className={isActive("/admin/guru-digest") ? "border-[#C7AE6A]" : "text-[#C7AE6A] border-[#C7AE6A]/30 border"}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                data-testid="button-nav-signout"
                className="text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/signin">
              <Button variant="default" data-testid="button-nav-signin">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
