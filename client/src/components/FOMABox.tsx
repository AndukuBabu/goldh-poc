import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface FOMABoxProps {
  title: string;
  description: string;
  variant?: "default" | "premium";
}

export function FOMABox({ title, description, variant = "default" }: FOMABoxProps) {
  return (
    <Card className={`border-2 ${
      variant === "premium" 
        ? "border-[#C7AE6A] bg-gradient-to-br from-[#C7AE6A]/10 via-[#b99a45]/5 to-transparent shadow-lg shadow-[#C7AE6A]/10" 
        : "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
    } hover-elevate transition-all hover:shadow-2xl hover:shadow-primary/20 group`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${
            variant === "premium"
              ? "bg-gradient-to-br from-[#C7AE6A] to-[#b99a45] shadow-md shadow-[#C7AE6A]/30"
              : "bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/30"
          } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Sparkles className="w-6 h-6 text-black animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${
              variant === "premium" ? "text-[#C7AE6A]" : "text-primary"
            }`}>{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
