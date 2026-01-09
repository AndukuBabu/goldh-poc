import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import {
    Activity,
    Database,
    Cloud,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Clock,
    Settings,
    ShieldCheck,
    Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HealthData {
    status: string;
    timestamp: string;
    version: string;
    node_env: string;
    db: {
        status: string;
        userCount: number;
        error: string | null;
    };
    zoho: {
        status: string;
        authenticated: boolean;
        error: string | null;
    };
    data: {
        umf: {
            cache_assets: number;
            firestore_assets: number;
            last_update: string | null;
        };
        news: {
            total_entries: number;
            last_update: string | null;
        };
        events: {
            total_entries: number;
            last_update: string | null;
        };
    };
    schedulers: {
        umf: {
            enabled: boolean;
            running: boolean;
            lastAttemptAt: string | null;
            lastSuccessAt: string | null;
            lastFailureAt: string | null;
            lastErrorMessage: string | null;
            nextTickAt: string | null;
            recentEvents: Array<{
                timestamp: string;
                type: 'info' | 'warn' | 'error' | 'success';
                message: string;
            }>;
        };
        news: {
            enabled: boolean;
            running: boolean;
            lastUpdateAt: string | null;
        };
    };
    secrets: Record<string, boolean>;
}

export default function AdminHealth() {
    const { data: health, isLoading, refetch, isFetching } = useQuery<HealthData>({
        queryKey: ["/api/admin/health"],
    });

    const [isTriggering, setIsTriggering] = useState(false);
    const { toast } = useToast();

    const handleTriggerRefresh = async () => {
        try {
            setIsTriggering(true);
            const response = await apiRequest("POST", "/api/admin/umf/refresh");
            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Refresh Triggered",
                    description: result.message || "Manual UMF tick started successfully.",
                });
                // Small delay to allow scheduler to start before refetching status
                setTimeout(() => refetch(), 1000);
            } else {
                throw new Error(result.message || "Failed to trigger refresh");
            }
        } catch (error: any) {
            toast({
                title: "Refresh Failed",
                description: error.message || "There was an error triggering the manual refresh.",
                variant: "destructive",
            });
        } finally {
            setIsTriggering(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ready":
            case "connected":
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "error":
            case "failed":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Activity className="h-5 w-5 text-yellow-500" />;
        }
    };

    const formatTimeStatus = (isoString: string | null) => {
        if (!isoString) return "Never";
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return "Never";

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(Math.abs(diffMs) / 60000);

            // Handle Future Times (e.g., Next Tick)
            if (diffMs < 0) {
                if (diffMins < 1) return "In < 1m";
                if (diffMins < 60) return `In ${diffMins}m`;
                return `In ${Math.floor(diffMins / 60)}h`;
            }

            // Handle Past Times (e.g., Last Tick)
            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
            return date.toLocaleDateString();
        } catch (e) {
            return "Never";
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#C7AE6A]" />
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-[#0f0f0f] text-white pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-[#C7AE6A] flex items-center gap-3">
                                <ShieldCheck className="h-10 w-10" />
                                System Health
                            </h1>
                            <p className="text-gray-400 mt-2">Mission Control & Diagnostics for Admin Team</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-gray-500">Version {health?.version || "1.0.0"}</p>
                                <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">{health?.node_env}</p>
                            </div>
                            <Button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                variant="outline"
                                className="border-[#C7AE6A] text-[#C7AE6A] hover:bg-[#C7AE6A] hover:text-black"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                                Refresh Status
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* 1. Infrastructure Card */}
                        <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Database className="h-5 w-5 text-blue-400" />
                                    Infrastructure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                    <span className="text-sm text-gray-300">PostgreSQL (Neon)</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{health?.db.userCount} users</span>
                                        {getStatusIcon(health?.db.status || "")}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                    <span className="text-sm text-gray-300">Firebase Cloud</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Admin SDK</span>
                                        {getStatusIcon("connected")}
                                    </div>
                                </div>
                                {health?.db.error && (
                                    <p className="text-xs text-red-500 mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                                        DB Error: {health.db.error}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. Integrations Card */}
                        <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-orange-500 to-yellow-500" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Cloud className="h-5 w-5 text-orange-400" />
                                    External Integrations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                    <span className="text-sm text-gray-300">Zoho CRM</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-[10px]">API v2</Badge>
                                        {getStatusIcon(health?.zoho.status || "")}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                    <span className="text-sm text-gray-300">CoinGecko</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-[10px]">Markets</Badge>
                                        {getStatusIcon("connected")}
                                    </div>
                                </div>
                                {health?.zoho.error && (
                                    <p className="text-xs text-red-500 mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                                        Zoho Error: {health.zoho.error}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. Schedulers Card */}
                        <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-purple-400" />
                                    Background Schedulers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">Market Overview (UMF)</span>
                                        <Badge variant={health?.schedulers.umf.enabled ? "default" : "secondary"} className="h-5">
                                            {health?.schedulers.umf.enabled ? "ACTIVE" : "DISABLED"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        Last Attempt: {formatTimeStatus(health?.schedulers.umf.lastAttemptAt || null)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-green-500 italic">
                                        <Zap className="h-3 w-3" />
                                        Last Success: {formatTimeStatus(health?.schedulers.umf.lastSuccessAt || null)}
                                    </div>
                                    {health?.schedulers.umf.lastFailureAt && (
                                        <div className="flex items-center gap-2 text-[10px] text-red-500 italic">
                                            <AlertCircle className="h-3 w-3" />
                                            Last Failure: {formatTimeStatus(health?.schedulers.umf.lastFailureAt || null)}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] text-purple-400">
                                        <RefreshCw className="h-3 w-3" />
                                        Next Tick: {formatTimeStatus(health?.schedulers.umf.nextTickAt || null)}
                                    </div>
                                    <Button
                                        onClick={handleTriggerRefresh}
                                        disabled={isTriggering || !health?.schedulers.umf.enabled}
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 h-7 text-[10px] border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white"
                                    >
                                        <Zap className={`h-3 w-3 mr-1 ${isTriggering ? "animate-spin" : ""}`} />
                                        {isTriggering ? "Refreshing..." : "Trigger Market Refresh"}
                                    </Button>
                                </div>
                                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">Guru News Updater</span>
                                        <Badge variant={health?.schedulers.news.running ? "default" : "secondary"} className="h-5">
                                            {health?.schedulers.news.running ? "RUNNING" : "STOPPED"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                                        <Zap className="h-3 w-3" />
                                        Last Tick: {formatTimeStatus(health?.schedulers.news.lastUpdateAt || null)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Data Inventory Card */}
                        <Card className="md:col-span-2 bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-green-400" />
                                    Data Freshness & Inventory
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-tight">Market Overview</p>
                                        <p className="text-2xl font-bold text-white">{health?.data.umf.firestore_assets}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Sync: {formatTimeStatus(health?.data.umf.last_update || null)}</p>
                                    </div>
                                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-tight">Guru Talk Articles</p>
                                        <p className="text-2xl font-bold text-white">{health?.data.news.total_entries}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Sync: {formatTimeStatus(health?.data.news.last_update || null)}</p>
                                    </div>
                                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-tight">Market Events</p>
                                        <p className="text-2xl font-bold text-white">{health?.data.events.total_entries}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Sync: {formatTimeStatus(health?.data.events.last_update || null)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 5. Secrets Verification Card */}
                        <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-gray-400" />
                                    Secret Verification
                                </CardTitle>
                                <CardDescription className="text-xs text-gray-500 italic">No values shown for security</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(health?.secrets || {}).map(([key, isSet]) => (
                                        <div key={key} className="flex items-center gap-2 p-1.5 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
                                            <div className={`h-2 w-2 rounded-full ${isSet ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} />
                                            <span className="text-[10px] font-mono text-gray-400 truncate">{key}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 6. Scheduler Logs (Full Width) */}
                    <div className="mt-8">
                        <Card className="bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-500" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-300">
                                    <Clock className="h-5 w-5" />
                                    Scheduler Diagnostic Logs (Recent Events)
                                </CardTitle>
                                <CardDescription className="text-xs text-gray-500">
                                    Real-time event stream from the UMF background scheduler
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] overflow-hidden">
                                    <div className="max-h-[300px] overflow-y-auto p-2 font-mono text-xs">
                                        {health?.schedulers.umf.recentEvents && health.schedulers.umf.recentEvents.length > 0 ? (
                                            <div className="space-y-1">
                                                {health.schedulers.umf.recentEvents.map((event, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a]/50">
                                                        <span className="text-gray-600 font-mono whitespace-nowrap">
                                                            [{new Date(event.timestamp).toLocaleTimeString()}]
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[9px] h-4 py-0 w-fit ${event.type === 'success' ? 'border-green-500 text-green-500' :
                                                                event.type === 'error' ? 'border-red-500 text-red-500' :
                                                                    event.type === 'warn' ? 'border-yellow-500 text-yellow-500' :
                                                                        'border-blue-500 text-blue-500'
                                                                }`}
                                                        >
                                                            {event.type.toUpperCase()}
                                                        </Badge>
                                                        <span className={`${event.type === 'error' ? 'text-red-400' :
                                                            event.type === 'warn' ? 'text-yellow-400' :
                                                                'text-gray-300'
                                                            }`}>
                                                            {event.message}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-gray-600 italic">
                                                No recent events recorded. Start the scheduler to see activity.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Manual Refresh Only
                        </span>
                        <Separator orientation="vertical" className="h-3 bg-gray-800" />
                        <span>Last Heartbeat: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "N/A"}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
