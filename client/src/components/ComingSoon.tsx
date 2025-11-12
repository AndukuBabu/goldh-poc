import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    icon: BarChart3,
    title: "Street Score",
    description: "Aggregates global Buy/Sell/Hold ratings into one unified confidence score."
  },
  {
    icon: Activity,
    title: "Whale Watch",
    description: "Visualises wallet activity, whale movements, and network health to reveal true market momentum."
  },
  {
    icon: Brain,
    title: "Yield Finder",
    description: "Finds and scores the safest, highest-yielding staking or DeFi opportunities by risk and reliability."
  },
  {
    icon: Zap,
    title: "Arbitrage Scanner",
    description: "Scans global exchanges for price differences on the same asset and alerts in real time."
  },
  {
    icon: FileText,
    title: "Copy Trade",
    description: "Lets users mirror top trader portfolios automatically, adjusted for risk."
  },
  {
    icon: Code,
    title: "Robo Trading Hub",
    description: "Deploy custom bots for DCA, stop-loss, and trend strategies that run automatically."
  },
  {
    icon: Gift,
    title: "Launch Radar",
    description: "Tracks upcoming token launches and listings across exchanges. Captures IPO–ICO–IDO breadth."
  },
  {
    icon: Bell,
    title: "Reward Hunter",
    description: "Aggregates verified airdrops and retroactive rewards ranked by credibility and expiry."
  },
  {
    icon: Shield,
    title: "Congressional Trading Tracker",
    description: "Monitors government and regulatory actions impacting digital assets and investment flows."
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
