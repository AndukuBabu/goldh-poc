import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Economic Calendar",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    icon: BookOpen,
    title: "Digest",
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    icon: TrendingUp,
    title: "UMF",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="hover-elevate active-elevate-2 transition-all group hover:shadow-xl hover:shadow-primary/10 border-border hover:border-primary/30" 
                  data-testid={`card-feature-${index}`}
                >
                  <CardHeader className="space-y-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                      <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
