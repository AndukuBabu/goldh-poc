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
      
      {/* Hero Section - Feature Cards */}
      <section className="min-h-screen flex items-center justify-center px-6">
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
              </p>
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
              <h2 className="text-4xl font-bold text-foreground">Digest</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
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
              <h2 className="text-4xl font-bold text-foreground">UMF</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
