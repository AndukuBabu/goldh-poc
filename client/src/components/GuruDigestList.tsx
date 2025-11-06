import { useEffect, useState } from "react";
import { getGuruDigest } from "../lib/getGuruDigest";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Loader2, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DigestEntry {
  title: string;
  summary: string;
  link: string;
  date: string;
}

export default function GuruDigestList() {
  const [digests, setDigests] = useState<DigestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGuruDigest()
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

  return (
    <div className="space-y-3">
      {digests.map((item, idx) => (
        <Card
          key={idx}
          className="hover-elevate active-elevate-2 transition-all border border-primary/20 hover:border-primary/40"
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
                <h3 className="text-base font-semibold text-primary leading-tight flex-1">
                  {item.title}
                </h3>
                <ExternalLink className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.summary}
              </p>
              {item.date && (
                <p className="text-xs text-muted-foreground/70">
                  {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                </p>
              )}
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
