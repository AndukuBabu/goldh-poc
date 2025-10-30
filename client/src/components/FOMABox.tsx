import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface FOMABoxProps {
  title: string;
  description: string;
  variant?: "default" | "premium";
}

export function FOMABox({ title, description, variant = "default" }: FOMABoxProps) {
  return (
    <Card className={`border-2 ${variant === "premium" ? "border-primary bg-primary/5" : "border-accent bg-accent/5"} hover-elevate transition-all`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
