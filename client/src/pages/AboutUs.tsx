import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Users, Target, Zap, Globe } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-6 mb-16">
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent"
              data-testid="text-about-title"
            >
              About GOLDH
            </h1>
            <p className="text-2xl sm:text-3xl font-semibold text-foreground">
              Building Wealth. Bridging Worlds.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Where the future of finance becomes clear, intelligent, and accessible for everyone.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            <Card className="p-8 space-y-4 hover-elevate" data-testid="card-mission-problem">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">The Problem</h3>
              <p className="text-muted-foreground leading-relaxed">
                Today's financial world is fragmented. Apps everywhere. Noise everywhere. Complexity everywhere.
                Tools built for traders, not humans. Markets built for insiders, not everyone.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate" data-testid="card-mission-solution">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Our Solution</h3>
              <p className="text-muted-foreground leading-relaxed">
                A single, unified platform to understand what's happening across crypto, equities, commodities,
                and macro events — with AI-driven insight and human-level clarity.
              </p>
            </Card>
          </div>

          {/* Who We Are Section */}
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent mb-12">
              Who We Are
            </h2>

            <Card className="p-8 md:p-12 space-y-6 bg-card/50 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-4">
                  <p className="text-lg text-foreground leading-relaxed">
                    GOLDH is built by a global team of technologists, analysts, and transformation leaders
                    with decades of experience inside asset management, fintech, AI, and digital innovation.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We've lived the challenges firsthand, and we built GOLDH to solve a simple problem:
                    <span className="text-primary font-semibold"> Make intelligent finance available to everyone</span> —
                    without compromising on quality, truth, or trust.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Core Principles */}
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent mb-4">
              Our Philosophy
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-12">
              Three principles that guide everything we build
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 space-y-4 hover-elevate" data-testid="card-principle-integrity">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-foreground">
                  Intelligence with Integrity
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Tools backed by real data, real analysis, and real accountability. No hype. No shortcuts.
                </p>
              </Card>

              <Card className="p-8 space-y-4 hover-elevate" data-testid="card-principle-clarity">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-foreground">
                  Clarity Over Complexity
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  No jargon. No overwhelm. Just clean, meaningful signals that help you make informed decisions.
                </p>
              </Card>

              <Card className="p-8 space-y-4 hover-elevate" data-testid="card-principle-empowerment">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-foreground">
                  Empowerment Without Ego
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  We educate and demystify without telling you what to think. Your decisions, your success.
                </p>
              </Card>
            </div>
          </div>

          {/* Closing CTA Section */}
          <div className="text-center">
            <Card className="p-12 bg-gradient-to-br from-card to-card/50 border-primary/20 hover-elevate">
              <div className="space-y-6 max-w-3xl mx-auto">
                <h3 className="text-3xl font-bold text-foreground">
                  The Next Era of Intelligent Finance
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're building more than a platform. We're building a new bridge between traditional finance,
                  digital assets, and the everyday investor.
                </p>

                <p className="text-xl font-semibold text-primary">
                  And you're early.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
