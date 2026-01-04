import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

interface DigestEntry {
  title: string;
  summary: string;
  link: string;
  date: string;
}

interface GuruDigestListProps {
  showAll?: boolean;
  truncateSummary?: boolean;
}

export default function GuruDigestList({ showAll = false, truncateSummary = false }: GuruDigestListProps) {
  const [digests, setDigests] = useState<DigestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch(`${window.location.origin}/api/news/guru-digest`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDigests(data as DigestEntry[]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching digests:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (digests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p>No digest entries yet. Check back soon!</p>
      </div>
    );
  }

  const displayedDigests = showAll ? digests : digests.slice(0, 5);

  return (
    <div className="space-y-3">
      {displayedDigests.map((item, idx) => (
        <Card
          key={idx}
          className="group hover:scale-[1.02] active-elevate-2 transition-all duration-300 border border-primary/20 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20"
          data-testid={`card-digest-${idx}`}
        >
          <CardContent className="p-4">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block space-y-2"
              data-testid={`link-digest-${idx}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold !text-white leading-tight flex-1 transition-colors">
                  {item.title}
                </h3>
                <ExternalLink className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              </div>
              <p className={`text-sm !text-zinc-400 leading-relaxed ${truncateSummary ? 'line-clamp-2' : ''}`}>
                {item.summary}
              </p>
              {item.date && (() => {
                try {
                  const parsedDate = new Date(item.date);
                  if (!isNaN(parsedDate.getTime())) {
                    return (
                      <p className="text-xs text-muted-foreground/70">
                        {formatDistanceToNow(parsedDate, { addSuffix: true })}
                      </p>
                    );
                  }
                } catch (e) {
                  return null;
                }
                return null;
              })()}
            </a>
          </CardContent>
        </Card>
      ))}

      {!showAll && digests.length > 5 && (
        <Button
          onClick={() => setLocation("/features/guru")}
          variant="outline"
          className="w-full mt-4 border-primary/30 hover:border-primary/60 text-primary hover:bg-primary/10"
          data-testid="button-view-all-digest"
        >
          View All Digest Entries
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
