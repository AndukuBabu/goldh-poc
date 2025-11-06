import { Header } from "@/components/Header";
import GuruDigestList from "@/components/GuruDigestList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function FeaturesGuru() {
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
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Guru & Insider Digest</h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Whale alerts. Smart wallet movements. Institutional fund flows.
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
              This isn't your average crypto news feed — this is the insider edge. Curated with machine learning and driven by real blockchain data, get instant alerts on whale movements, institutional purchases, and smart money activity across all major chains.
            </p>
          </div>

          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl">Latest Digest Entries</CardTitle>
              <CardDescription className="text-base">
                Real-time updates on significant market movements and insider activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GuruDigestList showAll={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
