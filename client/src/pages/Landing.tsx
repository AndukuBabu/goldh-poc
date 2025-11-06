import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { NewsScroller } from "@/components/NewsScroller";
import { FeatureCard } from "@/components/FeatureCard";
import { FOMABox } from "@/components/FOMABox";
import { TrendingUp, Shield, Zap, Bell, Globe, Users } from "lucide-react";
import logoImage from "@assets/goldh-logo_1762272901250.png";

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
      <section className="h-screen flex items-center justify-center px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Logo Side */}
            <div className="flex items-center justify-center">
              <img
                src={logoImage}
                alt="GOLDH - Golden Horizon"
                className="w-full h-auto"
                data-testid="img-hero-logo"
              />
            </div>

            {/* Content Side */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-normal bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent pb-2">
                  Building Wealth, Bridging Worlds
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Track, analyze, and grow your digital assets with real-time market intelligence and secure wallet integration.
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
          <div className="grid md:grid-cols-3 gap-6">
            <FOMABox
              title="GOLDH Token Launching Soon"
              description="Be among the first to access the GOLDH token. Early supporters get exclusive benefits and premium platform features. Don't miss this opportunity!"
              variant="premium"
            />
            <FOMABox
              title="Premium Access Coming Soon"
              description="Hold tokens or subscribe. Flexible for everyone. Multiple pathways to unlock premium features and exclusive benefits!"
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
      <section id="features" className="py-24 px-6 scroll-mt-16 bg-[#1a1a1a]">
        <div className="container mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful tools designed for both beginners and experienced crypto enthusiasts
            </p>
          </div>

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
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C7AE6A]/10 via-background to-[#b99a45]/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="container mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block px-6 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <span className="text-primary font-semibold">Limited Time Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Start Your Crypto Journey?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who trust GOLDH for their crypto intelligence needs. Start free today and unlock premium features as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/signin">
              <Button 
                size="lg" 
                className="text-lg px-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                data-testid="button-cta-signup"
              >
                Get Started Now
              </Button>
            </Link>
            <Link href="/learn">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-12 border-primary/30 hover:border-primary/50 hover:bg-primary/5" 
                data-testid="button-cta-learn"
              >
                Explore Learning Hub
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex justify-center gap-12 text-sm text-muted-foreground">
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

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-[#1a1a1a]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about GOLDH
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "What is GOLDH?",
                answer: "GOLDH (Golden Horizon) is a comprehensive crypto intelligence platform designed for everyone - from beginners to experienced traders. We provide real-time market insights, educational resources, portfolio tracking, and community features all in one place."
              },
              {
                question: "Is GOLDH free to use?",
                answer: "Yes! GOLDH offers a free forever plan with access to essential features. Premium members get exclusive features, early access to new tools, and enhanced analytics through token holdings or subscription."
              },
              {
                question: "How do I become a premium member?",
                answer: "We offer flexible Premium access! Hold 5000+ GOLDH tokens in your connected wallet for automatic Premium status, OR subscribe when subscriptions launch. Choose the pathway that works best for you!"
              },
              {
                question: "Is my wallet safe with GOLDH?",
                answer: "Absolutely. We use industry-leading security protocols and never store your private keys. Your wallet connection is secure, and you maintain full control of your assets at all times."
              },
              {
                question: "What kind of insights does GOLDH provide?",
                answer: "GOLDH offers real-time market data, AI-powered trend predictions, price alerts, portfolio analytics, and educational content. Our Learning Hub covers everything from blockchain basics to advanced trading strategies."
              },
              {
                question: "Can I use GOLDH on mobile?",
                answer: "Yes! GOLDH is fully responsive and works seamlessly on all devices - desktop, tablet, and mobile. Access your crypto intelligence anywhere, anytime."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                data-testid={`faq-item-${index}`}
              >
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link href="/signin">
              <Button variant="outline" className="border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border bg-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">GOLDH</h4>
              <p className="text-sm text-muted-foreground">
                Building Wealth, Bridging Worlds. Your gateway to crypto intelligence.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="/learn" className="hover:text-primary transition-colors">Learning Hub</Link></li>
                <li><Link href="/signin" className="hover:text-primary transition-colors">Premium</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 GOLDH - Golden Horizon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
