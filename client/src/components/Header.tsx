import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/goldh-logo_1761896683515.png";

export function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 hover-elevate cursor-pointer px-3 py-2 rounded-md transition-all">
            <img 
              src={logoImage} 
              alt="GOLDH Logo" 
              className="h-10 w-auto" 
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => scrollToSection("features")}
            data-testid="button-nav-features"
            className="text-foreground"
          >
            Features
          </Button>
          <Link href="/learn">
            <Button variant="ghost" data-testid="button-nav-learn" className="text-foreground">
              Learn
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" data-testid="button-nav-dashboard" className="text-foreground">
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
