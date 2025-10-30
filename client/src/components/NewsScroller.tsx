import { useEffect, useRef } from "react";

interface NewsArticle {
  id: string;
  title: string;
  url: string;
}

interface NewsScrollerProps {
  articles: NewsArticle[];
}

export function NewsScroller({ articles }: NewsScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      if (scroller) {
        scroller.scrollLeft = scrollPosition;
        
        if (scrollPosition >= scroller.scrollWidth / 2) {
          scrollPosition = 0;
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [articles]);

  const doubledArticles = [...articles, ...articles];

  return (
    <div className="w-full overflow-hidden bg-card border-y border-border py-4">
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-hidden"
        style={{ scrollBehavior: "auto" }}
      >
        {doubledArticles.map((article, index) => (
          <a
            key={`${article.id}-${index}`}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 hover-elevate active-elevate-2 px-4 py-2 rounded-md border border-border transition-all"
            data-testid={`link-news-${index}`}
          >
            <span className="text-sm text-foreground whitespace-nowrap">
              {article.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
