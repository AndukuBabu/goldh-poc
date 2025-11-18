import { Header } from "@/components/Header";
import { TrendingUp, Shield, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent pb-2" data-testid="text-about-title">
            About Us — GOLDH
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
            Building Wealth. Bridging Worlds.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="space-y-6 sm:space-y-8 mb-16 sm:mb-20">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            GOLDH is where the future of finance becomes clear, intelligent, and accessible.
            We bring together real market data, AI-driven insight, and human-level clarity so that
            anyone — from curious beginner to seasoned investor — can navigate global markets with
            confidence.
          </p>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Today's financial world is fragmented. Apps everywhere. Noise everywhere. Complexity
            everywhere.
          </p>

          <p className="text-lg sm:text-xl font-semibold text-primary">
            GOLDH changes that.
          </p>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Our platform gives you a single, unified place to understand what's happening across crypto,
            equities, commodities, and macro events — and why it matters.
          </p>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            We're creating a smarter, more connected community.
          </p>

          <div className="pl-4 sm:pl-6 border-l-4 border-primary space-y-2">
            <p className="text-base sm:text-lg font-medium text-foreground">No hype. No noise. No confusion.</p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Just clarity, intelligence, and the tools that help you think better, act smarter, and
              build wealth with intention.
            </p>
          </div>

          <p className="text-lg sm:text-xl font-semibold text-primary">
            This is the next era of intelligent finance.
          </p>

          <p className="text-lg sm:text-xl font-semibold text-primary">
            And you're early.
          </p>
        </div>

        {/* Who We Are Section */}
        <div className="space-y-8 sm:space-y-10 mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center bg-gradient-to-r from-[#e3d6b4] via-[#C7AE6A] to-[#b99a45] bg-clip-text text-transparent pb-2">
            Who We Are
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            GOLDH is built by a global team of technologists, analysts, and transformation leaders who
            have spent decades inside the worlds of asset management, fintech, AI, and digital
            innovation.
          </p>

          <div className="space-y-4">
            <p className="text-lg font-semibold text-foreground">We've lived the challenges:</p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Too much noise. Not enough clarity. Tools built for traders, not humans. Markets built for
              insiders, not everyone.
            </p>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            So, we built GOLDH to solve a simple problem:
          </p>

          <p className="text-lg sm:text-xl font-semibold text-primary text-center py-4">
            Make intelligent finance available to everyone — without compromising on quality,
            truth, or trust.
          </p>
        </div>

        {/* Philosophy Section */}
        <div className="space-y-8 sm:space-y-10 mb-16 sm:mb-20">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Our philosophy is grounded in three principles:
          </p>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Principle 1 */}
            <div className="space-y-4 p-6 rounded-lg border border-border bg-card hover-elevate" data-testid="card-principle-integrity">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-foreground">
                Intelligence with Integrity
              </h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Tools backed by real data, real analysis, and real accountability.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="space-y-4 p-6 rounded-lg border border-border bg-card hover-elevate" data-testid="card-principle-clarity">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-foreground">
                Clarity Over Complexity
              </h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                No jargon. No overwhelm. Just clean, meaningful signals.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="space-y-4 p-6 rounded-lg border border-border bg-card hover-elevate" data-testid="card-principle-empowerment">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center text-foreground">
                Empowerment Without Ego
              </h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                We educate, we demystify, and we guide, without telling you what to think.
              </p>
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center space-y-6 py-8 sm:py-12">
          <p className="text-lg sm:text-xl font-semibold text-foreground">
            We're building more than a platform.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We're building a new bridge between traditional finance, digital assets, and the everyday
            investor.
          </p>
        </div>
      </div>
    </div>
  );
}
