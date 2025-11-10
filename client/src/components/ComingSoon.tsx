import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Brain, 
  Shield, 
  FileText, 
  Bell, 
  Code, 
  Gift, 
  Zap, 
  BarChart3 
} from "lucide-react";

const comingSoonFeatures = [
  {
    icon: Activity,
    title: "Whale Tracker",
    description: "See exactly what the top wallets and crypto whales are doing in real time. Track movements, large token buys, and high-impact shifts across chains."
  },
  {
    icon: Brain,
    title: "Smart Token Screener",
    description: "Get intelligent filters and alerts for finding high-potential tokens based on on-chain, fundamental, and sentiment data."
  },
  {
    icon: Shield,
    title: "Risk Score Engine",
    description: "Instantly understand how safe or risky a yield farm or token is with our AI-driven score system, designed to prevent rug pulls and scams."
  },
  {
    icon: FileText,
    title: "Token Deep Dives",
    description: "Tap into powerful summaries of individual tokens, covering tokenomics, roadmaps, team info, and smart contract audits."
  },
  {
    icon: Bell,
    title: "AI Smart Alerts",
    description: "Set advanced alerts based on APY drops, token price swings, whale moves, or changes in risk score — not just price."
  },
  {
    icon: Code,
    title: "Smart Contract Scanner",
    description: "Understand what a smart contract is really doing before you interact with it. Our scanner gives an easy-to-read breakdown."
  },
  {
    icon: Gift,
    title: "Airdrop Finder",
    description: "Discover upcoming and hidden airdrops you may qualify for — based on wallet activity and social engagement."
  },
  {
    icon: Zap,
    title: "Pre-Token Detection",
    description: "Be the first to know about new tokens before they hit major aggregators. Get in early, responsibly."
  },
  {
    icon: BarChart3,
    title: "Portfolio Center",
    description: "Track your on-chain assets across wallets, chains, and tokens in one elegant dashboard — no extra tools needed."
  }
];

export function ComingSoon() {
  return (
    <section className="py-16 px-6" data-testid="section-coming-soon">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#C7AE6A" }}>
            Coming Soon to GOLDH
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The future of crypto intelligence is being built. Here's what's on the horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comingSoonFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 border-[#C7AE6A]/20 hover-elevate transition-all duration-300"
                data-testid={`card-feature-${index}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C7AE6A]/20 to-[#C7AE6A]/5 border border-[#C7AE6A]/30 flex items-center justify-center"
                    >
                      <Icon className="w-6 h-6 text-[#C7AE6A]" />
                    </div>
                    <CardTitle className="text-xl text-foreground">
                      {feature.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground">
            Want early access?{" "}
            <a 
              href="/signup" 
              className="text-[#C7AE6A] hover:underline font-semibold"
              data-testid="link-early-access"
            >
              Sign up now
            </a>
            {" "}to be notified when these features launch.
          </p>
        </div>
      </div>
    </section>
  );
}
