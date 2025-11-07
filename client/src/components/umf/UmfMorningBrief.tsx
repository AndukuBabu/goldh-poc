/**
 * UMF Morning Brief Component
 * 
 * Displays the AI-generated daily market intelligence brief with:
 * - Headline summarizing market sentiment
 * - 3-5 bullet points explaining key movements
 * - Timestamp of brief generation
 * - "Why it moved" narrative tone
 * - Copy to clipboard functionality
 * 
 * @see client/src/hooks/useUmf.ts - useUmfBrief() hook
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Clock, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UmfBrief } from "@shared/schema";

interface UmfMorningBriefProps {
  brief: UmfBrief;
  className?: string;
}

export function UmfMorningBrief({ brief, className }: UmfMorningBriefProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Format date for display
  const briefDate = new Date(brief.date_utc).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Format brief as copyable text
  const formatBriefForCopy = () => {
    const header = `Morning Intelligence - ${briefDate}\n`;
    const separator = '='.repeat(50) + '\n\n';
    const headline = `${brief.headline}\n\n`;
    const keyDrivers = 'KEY MARKET DRIVERS:\n';
    const bullets = brief.bullets.map((bullet, idx) => `${idx + 1}. ${bullet}`).join('\n');
    
    return header + separator + headline + keyDrivers + bullets;
  };

  // Copy brief to clipboard
  const handleCopyBrief = async () => {
    try {
      const textToCopy = formatBriefForCopy();
      await navigator.clipboard.writeText(textToCopy);
      
      setCopied(true);
      toast({
        title: "Brief copied!",
        description: "Morning intelligence copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={`bg-[#111] border-[#C7AE6A]/20 shadow-lg ${className || ''}`}
      data-testid="umf-morning-brief"
      role="article"
      aria-label="Morning market intelligence brief"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C7AE6A]/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#C7AE6A]" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl text-[#C7AE6A]">
              Morning Intelligence
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="bg-[#C7AE6A]/10 border-[#C7AE6A]/30 text-[#C7AE6A] text-xs"
              data-testid="brief-date-badge"
            >
              <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
              {briefDate}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyBrief}
              className="border-[#C7AE6A]/30 text-[#C7AE6A] hover:bg-[#C7AE6A]/10"
              aria-label="Copy morning brief to clipboard"
              data-testid="button-copy-brief"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Brief
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Headline - "Why it moved" summary */}
        <div>
          <h3 
            className="text-base font-semibold text-foreground leading-relaxed"
            data-testid="brief-headline"
          >
            {brief.headline}
          </h3>
        </div>

        <Separator className="bg-[#2a2a2a]" />

        {/* Key Insights - Bullet points */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Key Market Drivers
          </h4>
          <ul 
            className="space-y-3"
            role="list"
            aria-label="Key market insights"
            data-testid="brief-bullets"
          >
            {brief.bullets.map((bullet, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
                data-testid={`brief-bullet-${index}`}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-[#C7AE6A] mt-2 flex-shrink-0" 
                  aria-hidden="true"
                />
                <span className="flex-1">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
