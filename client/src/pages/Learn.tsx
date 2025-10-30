import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { LearningTopic } from "@shared/schema";

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState<string>("");
  const [filteredTopics, setFilteredTopics] = useState<LearningTopic[]>([]);

  const { data: learningTopics, isLoading } = useQuery<LearningTopic[]>({
    queryKey: ["/api/learning/topics"],
  });

  useEffect(() => {
    if (!learningTopics) return;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = learningTopics.filter(
        topic =>
          topic.title.toLowerCase().includes(query) ||
          topic.question.toLowerCase().includes(query) ||
          topic.answer.toLowerCase().includes(query)
      );
      setFilteredTopics(filtered);

      if (filtered.length > 0) {
        setExpandedItem(filtered[0].id);
        
        setTimeout(() => {
          const element = document.getElementById(`topic-${filtered[0].id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    } else {
      setFilteredTopics(learningTopics);
    }
  }, [searchQuery, learningTopics]);

  const handleRelatedClick = (topicId: string) => {
    setExpandedItem(topicId);
    setTimeout(() => {
      const element = document.getElementById(`topic-${topicId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Learning Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your friendly guide to understanding crypto and blockchain. Simple explanations for everyone.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for any crypto term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
                data-testid="input-search-topics"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-muted-foreground">
                Found {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Topics Accordion */}
          <Card>
            <CardContent className="p-6">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    No topics found matching "{searchQuery}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for blockchain, wallet, token, or staking
                  </p>
                </div>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  value={expandedItem}
                  onValueChange={setExpandedItem}
                  className="space-y-2"
                >
                  {filteredTopics.map((topic, index) => (
                    <AccordionItem
                      key={topic.id}
                      value={topic.id}
                      id={`topic-${topic.id}`}
                      className="border border-border rounded-md px-4 scroll-mt-24"
                      data-testid={`accordion-topic-${topic.id}`}
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="flex items-start gap-3 pr-4">
                          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-sm font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {topic.question}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {topic.title}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 pl-11">
                        <p className="text-base text-foreground leading-relaxed mb-4">
                          {topic.answer}
                        </p>
                        
                        {topic.relatedTopics && topic.relatedTopics.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                              You might also like:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {topic.relatedTopics.map((relatedId) => {
                                const relatedTopic = learningTopics?.find(t => t.id === relatedId);
                                return relatedTopic ? (
                                  <button
                                    key={relatedId}
                                    onClick={() => handleRelatedClick(relatedId)}
                                    className="text-sm px-3 py-1 rounded-md bg-primary/10 text-primary hover-elevate active-elevate-2 transition-all"
                                    data-testid={`button-related-${relatedId}`}
                                  >
                                    {relatedTopic.title}
                                  </button>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
