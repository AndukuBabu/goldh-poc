import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { NewsScroller } from "@/components/NewsScroller";
import { FeatureCard } from "@/components/FeatureCard";
import { FOMABox } from "@/components/FOMABox";
import { TrendingUp, Shield, Zap, Bell, Globe, Users } from "lucide-react";
import logoImage from "@assets/goldh-logo_1761848842384.png";

const mockNews = [
  { id: "1", title: "Bitcoin surges past $50K as institutional adoption grows", url: "#" },
  { id: "2", title: "Ethereum 2.0 staking rewards reach new highs", url: "#" },
  { id: "3", title: "DeFi protocols see 200% growth in TVL this quarter", url: "#" },
  { id: "4", title: "Major banks announce blockchain integration plans", url: "#" },
  { id: "5", title: "NFT marketplace volume breaks all-time records", url: "#" },
  { id: "6", title: "Crypto regulation clarity expected in Q2", url: "#" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time Market Intelligence",
    description: "Get instant insights on crypto markets with advanced analytics and trend predictions powered by AI."
  },
  {
    icon: Shield,
    title: "Secure Wallet Integration",
    description: "Connect your wallet safely with industry-leading security protocols. Your assets, your control."
  },
  {
    icon: Zap,
    title: "Lightning-Fast Alerts",
    description: "Never miss important market movements with customizable notifications delivered instantly."
  },
  {
    icon: Bell,
    title: "Smart Price Tracking",
    description: "Track your favorite tokens and get alerted when they hit your target prices."
  },
  {
    icon: Globe,
    title: "Global Market Coverage",
    description: "Access data from exchanges worldwide, all in one unified platform."
  },
  {
    icon: Users,
    title: "Community Insights",
    description: "Learn from experienced traders and share strategies with our growing community."
  }
];

export default function Landing() {
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Logo Side */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                <img
                  src={logoImage}
                  alt="GOLDH - Golden Horizon"
                  className="relative w-full max-w-md h-auto"
                  data-testid="img-hero-logo"
                />
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Building Wealth,<br />
                  <span className="text-primary">Bridging Worlds</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Your gateway to crypto intelligence. Track, analyze, and grow your digital assets with confidence.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signin">
                  <Button size="lg" className="text-lg px-8" data-testid="button-hero-start">
                    Start Free
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={scrollToFeatures}
                  data-testid="button-hero-learn"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOMO Boxes */}
      <section className="py-12 px-6 bg-card/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <FOMABox
              title="GOLDH Token Launching Soon"
              description="Be among the first to access the GOLDH token. Early supporters get exclusive benefits and premium platform features. Don't miss this opportunity!"
              variant="premium"
            />
            <FOMABox
              title="Early User Status"
              description="Sign up early and get exclusive benefits. More rewards, more features, more opportunities. Your journey to crypto mastery starts here."
              variant="default"
            />
          </div>
        </div>
      </section>

      {/* News Scroller */}
      <section className="py-8">
        <div className="container mx-auto px-6 mb-4">
          <h2 className="text-2xl font-bold text-foreground">Latest Crypto News</h2>
        </div>
        <NewsScroller articles={mockNews} />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 scroll-mt-16">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful tools designed for both beginners and experienced crypto enthusiasts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to Start Your Crypto Journey?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who trust GOLDH for their crypto intelligence needs
          </p>
          <Link href="/signin">
            <Button size="lg" className="text-lg px-12" data-testid="button-cta-signup">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 GOLDH - Golden Horizon. Building Wealth, Bridging Worlds.
          </p>
        </div>
      </footer>
    </div>
  );
}
