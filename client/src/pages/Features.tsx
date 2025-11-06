import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const features = [
  {
    icon: Calendar,
    title: "Economic Calendar",
    shortDescription: "Global crypto-relevant macroeconomic events delivered in real time — with intelligent summaries, live countdowns, and impact signals powered by AI.",
    fullDescription: "Global crypto-relevant macroeconomic events delivered in real time — with intelligent summaries, live countdowns, and impact signals powered by AI. From Fed decisions to inflation releases, never get blindsided again.",
    route: "/features/calendar"
  },
  {
    icon: BookOpen,
    title: "Guru & Insider Digest",
    shortDescription: "Whale alerts. Smart wallet movements. Institutional fund flows. This isn't your average crypto news feed — this is the insider edge.",
    fullDescription: "Whale alerts. Smart wallet movements. Institutional fund flows. This isn't your average crypto news feed — this is the insider edge. Curated with machine learning and driven by real blockchain data.",
    route: "/features/guru"
  },
  {
    icon: TrendingUp,
    title: "Universal Market Financials",
    shortDescription: "One page to track everything. Token prices, market caps, daily volumes, and trend summaries across the top 100 assets.",
    fullDescription: "One page to track everything. Token prices, market caps, daily volumes, and trend summaries across the top 100 assets. Built for context-first investing and supported by beautiful, responsive UX.",
    route: "/features/umf"
  }
];

export default function Features() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Feature Cards */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-[#d5c28f] to-primary bg-clip-text text-transparent">
              Platform Features
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools designed to give you the crypto intelligence edge
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:scale-105 active-elevate-2 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/30 border-border hover:border-primary/60 cursor-pointer relative overflow-hidden" 
                  data-testid={`card-feature-${index}`}
                  onClick={() => setLocation(feature.route)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="space-y-4 relative z-10">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.shortDescription}
                    </CardDescription>
                    <Button 
                      variant="ghost" 
                      className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-all"
                      data-testid={`button-view-feature-${index}`}
                    >
                      Full View
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Economic Calendar Details Section */}
      <section className="w-full py-24 px-6 bg-[#1a1a1a]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-start gap-8">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Economic Calendar</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {features[0].fullDescription}
              </p>
              <Button 
                onClick={() => setLocation("/features/calendar")}
                className="mt-6"
                data-testid="button-explore-calendar"
              >
                Explore Calendar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Digest Details Section */}
      <section className="w-full py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-start gap-8">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Guru & Insider Digest</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {features[1].fullDescription}
              </p>
              <Button 
                onClick={() => setLocation("/features/guru")}
                className="mt-6"
                data-testid="button-explore-digest"
              >
                Explore Digest
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* UMF Details Section */}
      <section className="w-full py-24 px-6 bg-[#1a1a1a]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-start gap-8">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Universal Market Financials</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {features[2].fullDescription}
              </p>
              <Button 
                onClick={() => setLocation("/features/umf")}
                className="mt-6"
                data-testid="button-explore-umf"
              >
                Explore UMF
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
