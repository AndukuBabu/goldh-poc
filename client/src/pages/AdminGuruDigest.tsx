import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, RefreshCw, Plus, Loader2, Eye, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const addEntrySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  link: z.string().url("Must be a valid URL"),
  assets: z.string().optional(),
});

type AddEntryForm = z.infer<typeof addEntrySchema>;

interface GuruDigestEntry {
  id: string;
  title: string;
  summary: string;
  link: string;
  date: string;
  assets: string[];
}

export default function AdminGuruDigest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<GuruDigestEntry | null>(null);
  const [isUploadingEC, setIsUploadingEC] = useState(false);
  const [ecFilePreview, setEcFilePreview] = useState<{ filename: string; count: number } | null>(null);

  const form = useForm<AddEntryForm>({
    resolver: zodResolver(addEntrySchema),
    defaultValues: {
      title: "",
      summary: "",
      link: "",
      assets: "",
    },
  });

  const { data: entries, isLoading } = useQuery<GuruDigestEntry[]>({
    queryKey: ["/api/admin/guru-digest"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: AddEntryForm) => {
      const assets = data.assets ? data.assets.split(',').map(a => a.trim()) : [];
      return apiRequest("POST", "/api/admin/guru-digest", { ...data, assets });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guru-digest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru-digest"] });
      form.reset();
      toast({
        title: "Success",
        description: "Article added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add article",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/guru-digest/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guru-digest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru-digest"] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiRequest("POST", "/api/admin/guru-digest/refresh", { clearFirst: false });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guru-digest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru-digest"] });
      toast({
        title: "Success",
        description: "RSS feed refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh RSS feed",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleECFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const events = JSON.parse(text);
      
      if (!Array.isArray(events)) {
        toast({
          title: "Invalid File",
          description: "JSON file must contain an array of events",
          variant: "destructive",
        });
        return;
      }

      setEcFilePreview({ filename: file.name, count: events.length });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse JSON file",
        variant: "destructive",
      });
    }
  };

  const handleECUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEC(true);
    try {
      const text = await file.text();
      const events = JSON.parse(text);

      const response = await apiRequest("POST", "/api/admin/econ-events/upload", { events });
      const result = await response.json();
      
      setEcFilePreview(null);
      e.target.value = "";
      
      toast({
        title: "Success",
        description: `Uploaded ${result.uploaded} events (deleted ${result.deleted} old events). Total: ${result.total} events.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload events",
        variant: "destructive",
      });
    } finally {
      setIsUploadingEC(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0f0f0f] text-white pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#C7AE6A] mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Guru Talk Management</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="border-[#C7AE6A] text-[#C7AE6A] hover:bg-[#C7AE6A] hover:text-black"
            data-testid="button-refresh-rss"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh RSS Feed
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-[#C7AE6A] flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Article
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manually add a custom article to Guru Talk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Article title"
                            className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Summary</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Article summary or excerpt"
                            rows={4}
                            className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
                            data-testid="input-summary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://..."
                            className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
                            data-testid="input-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Asset Tags</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="BTC, ETH, SOL (comma-separated)"
                            className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
                            data-testid="input-assets"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 text-sm">
                          Optional. Separate multiple assets with commas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#C7AE6A] text-black hover:bg-[#D4BD7A]"
                    disabled={addMutation.isPending}
                    data-testid="button-add-article"
                  >
                    {addMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Article
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-[#C7AE6A]">Manage Articles</CardTitle>
              <CardDescription className="text-gray-400">
                {entries ? `${entries.length} articles in database` : "Loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C7AE6A]" />
                </div>
              ) : entries && entries.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#C7AE6A] transition-colors"
                      data-testid={`article-${entry.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {entry.summary}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            {entry.assets && entry.assets.length > 0 && (
                              <>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex gap-1 flex-wrap">
                                  {entry.assets.map((asset) => (
                                    <Badge
                                      key={asset}
                                      variant="outline"
                                      className="text-xs border-[#C7AE6A] text-[#C7AE6A]"
                                    >
                                      {asset}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewingEntry(entry)}
                            className="text-[#C7AE6A] hover:text-[#C7AE6A] hover:bg-[#C7AE6A]/10"
                            data-testid={`button-view-${entry.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(entry.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            data-testid={`button-delete-${entry.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No articles found. Add one or refresh the RSS feed.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Economic Calendar Upload Section */}
        <Separator className="bg-[#2a2a2a] my-8" />
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#C7AE6A] mb-2">Market Events Calendar</h2>
          <p className="text-gray-400">Upload Economic Calendar Data</p>
        </div>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-[#C7AE6A] flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload JSON Events
            </CardTitle>
            <CardDescription className="text-gray-400">
              Upload economic calendar events from JSON file. Auto-deletes events older than 2 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Select JSON File
              </label>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleECUpload}
                disabled={isUploadingEC}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#C7AE6A] file:text-black
                  hover:file:bg-[#D4BD7A]
                  file:cursor-pointer cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="input-ec-upload"
              />
            </div>

            {isUploadingEC && (
              <div className="flex items-center gap-2 text-[#C7AE6A]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading events...</span>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>• JSON file must contain an array of event objects</p>
              <p>• Required fields: title, country, date, impact, forecast, previous</p>
              <p>• Automatically removes events older than 2 months during upload</p>
              <p>• Preserves existing events from previous uploads</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      {/* View Article Dialog */}
      <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#C7AE6A] text-xl">Article Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              View full article information
            </DialogDescription>
          </DialogHeader>
          {viewingEntry && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Title</h3>
                <p className="text-white">{viewingEntry.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Summary</h3>
                <p className="text-white whitespace-pre-wrap">{viewingEntry.summary}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">URL</h3>
                <a 
                  href={viewingEntry.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#C7AE6A] hover:underline break-all"
                >
                  {viewingEntry.link}
                </a>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Published Date</h3>
                <p className="text-white">{new Date(viewingEntry.date).toLocaleString()}</p>
              </div>
              {viewingEntry.assets && viewingEntry.assets.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Asset Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {viewingEntry.assets.map((asset) => (
                      <Badge
                        key={asset}
                        variant="outline"
                        className="border-[#C7AE6A] text-[#C7AE6A]"
                      >
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Entry ID</h3>
                <p className="text-gray-500 text-xs font-mono">{viewingEntry.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
