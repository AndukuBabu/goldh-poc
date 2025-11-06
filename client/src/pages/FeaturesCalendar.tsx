import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function FeaturesCalendar() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/features")}
            className="mb-6"
            data-testid="button-back-features"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Features
          </Button>

          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Economic Calendar</h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Never miss a market-moving event.
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
              Global crypto-relevant macroeconomic events delivered in real time — with intelligent summaries, live countdowns, and impact signals powered by AI. From Fed decisions to inflation releases, never get blindsided again. Track CPI reports, FOMC meetings, regulatory announcements, and more.
            </p>
          </div>

          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl">Coming Soon</CardTitle>
              <CardDescription className="text-base">
                The Economic Calendar with AI Impact analysis is currently under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Under Construction</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're building an intelligent economic calendar that tracks all crypto-relevant 
                  macroeconomic events with AI-powered impact analysis, live countdowns, and 
                  real-time notifications.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Stay tuned for updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
