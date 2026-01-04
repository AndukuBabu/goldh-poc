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
            lastCallAt: string | null;
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

    const formatLastUpdate = (isoString: string | null) => {
        if (!isoString) return "Never";
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return "Never";

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 0) return "Just now"; // Handle slight clock skews
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
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                                        <Zap className="h-3 w-3" />
                                        Last Tick: {formatLastUpdate(health?.schedulers.umf.lastCallAt || null)}
                                    </div>
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
                                        Last Tick: {formatLastUpdate(health?.schedulers.news.lastUpdateAt || null)}
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
                                        <p className="text-[10px] text-gray-400 mt-1">Sync: {formatLastUpdate(health?.data.umf.last_update || null)}</p>
                                    </div>
                                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-tight">Guru Talk Articles</p>
                                        <p className="text-2xl font-bold text-white">{health?.data.news.total_entries}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Sync: {formatLastUpdate(health?.data.news.last_update || null)}</p>
                                    </div>
                                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-tight">Market Events</p>
                                        <p className="text-2xl font-bold text-white">{health?.data.events.total_entries}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Sync: {formatLastUpdate(health?.data.events.last_update || null)}</p>
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
