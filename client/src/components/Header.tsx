import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/goldh-logo_1762272901250.png";

export function Header() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/features") {
      return location === path || location.startsWith("/features/");
    }
    return location === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 hover-elevate cursor-pointer px-3 py-2 rounded-md transition-all">
            <img 
              src={logoImage} 
              alt="GOLDH Logo" 
              className="h-16 w-auto" 
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
          <Link href="/signin">
            <Button variant="default" data-testid="button-nav-signin">
              Sign In
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
