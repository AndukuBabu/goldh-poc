import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2 transition-all group hover:shadow-xl hover:shadow-primary/10 border-border hover:border-primary/30">
      <CardHeader className="space-y-4">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
          <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
