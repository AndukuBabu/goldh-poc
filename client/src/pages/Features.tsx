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
                <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
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
