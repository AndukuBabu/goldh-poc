import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { TrendingUp, Shield, Zap, Bell, Globe, Users } from "lucide-react";

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

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#C7AE6A]/10 via-background to-[#b99a45]/10">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent">
            Everything You Need
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Simple, powerful tools designed for both beginners and experienced crypto enthusiasts. 
            Track, analyze, and grow your digital assets with confidence.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="py-24 px-6 bg-[#1a1a1a]">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who trust GOLDH for their crypto intelligence needs. 
            Start free today and unlock premium features as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="text-lg px-12" 
                data-testid="button-features-signup"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/learn">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-12" 
                data-testid="button-features-learn"
              >
                Explore Learning Hub
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features"><a className="text-muted-foreground hover:text-primary transition-colors">Features</a></Link></li>
                <li><Link href="/dashboard"><a className="text-muted-foreground hover:text-primary transition-colors">Dashboard</a></Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/learn"><a className="text-muted-foreground hover:text-primary transition-colors">Learn</a></Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2024 GOLDH. Building Wealth, Bridging Worlds.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
