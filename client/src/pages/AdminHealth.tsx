import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
    ShieldCheck,
    Zap,
    Cpu,
    Server,
    Globe,
    Terminal as TerminalIcon,
    AlertTriangle,
    Play,
    Square,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

// --- UTILITIES ---

const parseTimestamp = (ts: any): Date => {
    try {
        if (!ts) return new Date();
        if (ts instanceof Date) return ts;
        if (typeof ts === 'string') return new Date(ts);
        if (typeof ts === 'number') return new Date(ts);

        // Handle Firestore Timestamp objects (emulator vs production variants)
        const seconds = ts._seconds ?? ts.seconds;
        if (seconds !== undefined) return new Date(Number(seconds) * 1000);

        const d = new Date(ts);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch {
        return new Date();
    }
};

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
            status: string;
            last_run_timestamp: string | null;
            error?: string | null;
            recentEvents?: Array<{
                timestamp: string;
                type: 'info' | 'warn' | 'error' | 'success';
                message: string;
            }>;
        };
        news: {
            enabled: boolean;
            status: string;
            last_run_timestamp: string | null;
            error?: string | null;
            recentEvents?: Array<{
                timestamp: string;
                type: 'info' | 'warn' | 'error' | 'success';
                message: string;
            }>;
        };
    };
    secrets: Record<string, boolean>;
}

// --- SUBCOMPONENTS ---

function TelemetryGauge({ title, value, lastUpdate, thresholdMins = 60 }: { title: string, value: string | number, lastUpdate: string | null, thresholdMins?: number }) {
    const freshness = useMemo(() => {
        if (!lastUpdate) return { percent: 0, label: "STALE", color: "text-red-500", border: "border-red-500/20" };

        const date = parseTimestamp(lastUpdate);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);

        if (mins < thresholdMins) return { percent: 100, label: "FRESH", color: "text-green-400", border: "border-green-500/20" };
        if (mins < thresholdMins * 2) return { percent: 50, label: "DEGRADING", color: "text-yellow-400", border: "border-yellow-500/20" };
        return { percent: 10, label: "STALE", color: "text-red-400", border: "border-red-500/20" };
    }, [lastUpdate, thresholdMins]);

    return (
        <div className={`p-4 bg-[#141414] rounded-xl border ${freshness.border} relative overflow-hidden group hover:bg-[#1a1a1a] transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
                <Badge variant="outline" className={`text-[8px] h-4 ${freshness.color} border-current opacity-70`}>{freshness.label}</Badge>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
            </div>
            <div className="mt-3 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${freshness.color.replace('text', 'bg')}`}
                    style={{ width: `${freshness.percent}%` }}
                />
            </div>
            <div className="mt-2 text-[9px] text-gray-500 font-mono">
                LAST_SYNC: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "UNKNOWN"}
            </div>
        </div>
    );
}

function ConnectivityNode({ name, status, label, icon: Icon }: { name: string, status: string, label: string, icon: any }) {
    const isOnline = status === "connected" || status === "ready" || status === "success";
    return (
        <div className="flex items-center gap-3 p-3 bg-[#111] rounded-lg border border-[#222]">
            <div className={`p-2 rounded-md ${isOnline ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <div className="text-[10px] font-medium text-gray-500 uppercase">{name}</div>
                <div className="text-xs font-semibold text-gray-300">{label}</div>
            </div>
            <div className={`h-2 w-2 rounded-full animate-pulse ${isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`} />
        </div>
    );
}

export default function AdminHealth() {
    const { data: health, isLoading, refetch, isFetching } = useQuery<HealthData>({
        queryKey: ["/api/admin/health"],
    });

    const [isTriggering, setIsTriggering] = useState(false);
    const [isToggling, setIsToggling] = useState<string | null>(null);
    const { toast } = useToast();
    const { sessionId } = useAuth();

    const handleTriggerRefresh = async (type: 'umf' | 'guru') => {
        try {
            setIsTriggering(true);

            const endpoint = type === 'umf' ? '/api/admin/umf/refresh' : '/api/admin/guru-digest/refresh';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `Failed to trigger ${type}`);
            }

            if (data.success) {
                toast({ title: `${type.toUpperCase()} Synchronized`, description: data.message });
                setTimeout(() => refetch(), 1000);
            } else {
                toast({ title: "Refresh Triggered", description: `Manual ${type.toUpperCase()} cycle started: ${data.message}` });
            }
        } catch (error: any) {
            toast({ title: "Trigger Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsTriggering(false);
        }
    };

    const handleToggleScheduler = async (schedulerId: 'umf' | 'guru', enabled: boolean) => {
        setIsToggling(schedulerId);
        try {
            const response = await fetch('/api/admin/scheduler/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedulerId, enabled }),
            });

            if (!response.ok) throw new Error(await response.text());

            toast({
                title: enabled ? "Scheduler Started" : "Scheduler Stopped",
                description: `Automation for ${schedulerId.toUpperCase()} is now ${enabled ? 'active' : 'suspended'}.`,
            });
            refetch(); // Refresh status
        } catch (error: any) {
            toast({ title: "Toggle Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsToggling(null);
        }
    };

    const globalStatus = useMemo(() => {
        if (!health) return { label: "OFFLINE", color: "text-gray-500", bg: "bg-gray-500/10", icon: AlertTriangle };
        const hasError = health.db.status === "error" || health.zoho.status === "error";
        if (hasError) return { label: "ATTENTION REQUIRED", color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle };
        return { label: "SYSTEM NOMINAL", color: "text-green-500", bg: "bg-green-500/10", icon: ShieldCheck };
    }, [health]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-10 w-10 animate-spin text-[#C7AE6A]" />
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Initialising Diagnostics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Header />
            <div className="pt-24 pb-12 px-6 text-white selection:bg-[#C7AE6A]/30">
                <div className="container mx-auto max-w-6xl">

                    {/* 1. TOP BANNER: GLOBAL STATUS */}
                    <div className={`mb-8 p-4 rounded-xl border ${globalStatus.color.replace('text', 'border')}/20 ${globalStatus.bg} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${globalStatus.bg} ${globalStatus.color}`}>
                                <globalStatus.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className={`text-sm font-black tracking-tighter uppercase ${globalStatus.color}`}>
                                    {globalStatus.label}
                                </h1>
                                <p className="text-[10px] text-gray-500 font-mono">
                                    NODE_ID: {health?.node_env.toUpperCase()} // BUILD: {health?.version} // TS: {new Date().toISOString()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-white uppercase"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-3 w-3 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                            Sync Dashboard
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* 2. TELEMETRY CENTER (LEFT 8 COLS) */}
                        <div className="lg:col-span-8 space-y-6">

                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Activity className="h-4 w-4 text-[#C7AE6A]" />
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Real-time Telemetry</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TelemetryGauge
                                    title="Market Data (UMF)"
                                    value={health?.data.umf.firestore_assets || 0}
                                    lastUpdate={health?.data.umf.last_update || null}
                                    thresholdMins={65}
                                />
                                <TelemetryGauge
                                    title="Guru Digest"
                                    value={health?.data.news.total_entries || 0}
                                    lastUpdate={health?.data.news.last_update || null}
                                    thresholdMins={180}
                                />
                                <TelemetryGauge
                                    title="Event Calendar"
                                    value={health?.data.events.total_entries || 0}
                                    lastUpdate={health?.data.events.last_update || null}
                                    thresholdMins={1440}
                                />
                            </div>

                            {/* 3. LOG TERMINAL */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <TerminalIcon className="h-4 w-4 text-gray-500" />
                                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Diagnostic Stream</h2>
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-600 animate-pulse">● LIVE_FEED</span>
                                </div>
                                <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl">
                                    <div className="h-6 bg-[#1a1a1a] flex items-center px-4 gap-1.5 border-b border-[#0f0f0f]">
                                        <div className="h-2 w-2 rounded-full bg-red-500/50" />
                                        <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                                        <div className="h-2 w-2 rounded-full bg-green-500/50" />
                                        <div className="ml-auto text-[8px] font-mono text-gray-600">STDOUT : UTF-8</div>
                                    </div>
                                    <div className="h-[320px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-gray-800">
                                        {(() => {
                                            const allEvents = [
                                                ...(health?.schedulers.umf.recentEvents || []),
                                                ...(health?.schedulers.news.recentEvents || [])
                                            ].sort((a, b) => {
                                                const tA = parseTimestamp(a.timestamp).getTime();
                                                const tB = parseTimestamp(b.timestamp).getTime();
                                                return tB - tA;
                                            }).slice(0, 20);

                                            if (allEvents.length === 0) {
                                                return <div className="text-gray-700 italic">No cycles recorded in recent buffer.</div>;
                                            }

                                            return allEvents.map((event, idx) => {
                                                const date = parseTimestamp(event.timestamp);
                                                const dayStr = date.toLocaleDateString([], { month: 'short', day: '2-digit' });
                                                const timeStr = isNaN(date.getTime()) ? "00:00:00" : date.toLocaleTimeString([], { hour12: false });

                                                return (
                                                    <div key={idx} className="flex gap-4 group py-0.5 border-l border-gray-900 pl-3 hover:border-gray-700">
                                                        <span className="text-gray-700 shrink-0">[{dayStr} {timeStr}]</span>
                                                        <span className={`uppercase font-bold shrink-0 ${event.type === 'error' ? 'text-red-500' :
                                                            event.type === 'warn' ? 'text-yellow-500' :
                                                                event.type === 'success' ? 'text-green-500' : 'text-blue-500'
                                                            }`}>{event.type.padEnd(7)}</span>
                                                        <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{event.message}</span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                        <div className="mt-4 flex animate-pulse">
                                            <div className="h-3 w-1.5 bg-[#C7AE6A]" />
                                            <span className="ml-2 text-gray-800">Ready for incoming events...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. OPERATIONS COMMAND (RIGHT 4 COLS) */}
                        <div className="lg:col-span-4 space-y-6">

                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Cpu className="h-4 w-4 text-[#C7AE6A]" />
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Operational Control</h2>
                            </div>

                            <Card className="bg-[#141414] border-[#222] rounded-xl overflow-hidden shadow-lg">
                                <CardContent className="p-4 space-y-4">
                                    {/* UMF CONTROL */}
                                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-purple-400" />
                                                <span className="text-xs font-bold text-gray-300">UMF_TRACKER</span>
                                            </div>
                                            <Badge variant={health?.schedulers.umf.enabled ? "default" : "secondary"} className={`h-5 text-[9px] ${health?.schedulers.umf.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}`}>
                                                {health?.schedulers.umf.enabled ? "ACTIVE" : "DISABLED"}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="text-center p-2 bg-[#111] rounded border border-[#222]">
                                                <div className="text-[8px] text-gray-500 uppercase">State</div>
                                                <div className="text-[10px] font-mono text-green-400 uppercase">{health?.schedulers.umf.status || "IDLE"}</div>
                                            </div>
                                            <div className="text-center p-2 bg-[#111] rounded border border-[#222]">
                                                <div className="text-[8px] text-gray-500 uppercase">Frequency</div>
                                                <div className="text-[10px] font-mono text-gray-400">60m</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {health?.schedulers.umf.enabled ? (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="flex-1 h-8 text-[10px] font-bold bg-red-950/30 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                                                    onClick={() => handleToggleScheduler('umf', false)}
                                                    disabled={isToggling === 'umf'}
                                                >
                                                    {isToggling === 'umf' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3 mr-1.5" />}
                                                    STOP AUTOMATION
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-8 text-[10px] font-bold bg-green-950/30 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white transition-all"
                                                    onClick={() => handleToggleScheduler('umf', true)}
                                                    disabled={isToggling === 'umf'}
                                                >
                                                    {isToggling === 'umf' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-1.5" />}
                                                    START AUTOMATION
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                className="h-8 px-3 text-xs font-bold bg-[#C7AE6A] text-black hover:bg-white transition-all"
                                                onClick={() => handleTriggerRefresh('umf')}
                                                disabled={isTriggering}
                                                title="Trigger Manual Cycle"
                                            >
                                                <Zap className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* NEWS CONTROL */}
                                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Server className="h-4 w-4 text-blue-400" />
                                                <span className="text-xs font-bold text-gray-300">GURU_SYNC</span>
                                            </div>
                                            <Badge variant={health?.schedulers.news.enabled ? "default" : "secondary"} className={`h-5 text-[9px] ${health?.schedulers.news.enabled ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}`}>
                                                {health?.schedulers.news.enabled ? "ACTIVE" : "DISABLED"}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="text-center p-2 bg-[#111] rounded border border-[#222]">
                                                <div className="text-[8px] text-gray-500 uppercase">State</div>
                                                <div className="text-[10px] font-mono text-blue-400 uppercase">{health?.schedulers.news.status || "IDLE"}</div>
                                            </div>
                                            <div className="text-center p-2 bg-[#111] rounded border border-[#222]">
                                                <div className="text-[8px] text-gray-500 uppercase">Daily_Runs</div>
                                                <div className="text-[10px] font-mono text-gray-400">20x</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {health?.schedulers.news.enabled ? (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="flex-1 h-8 text-[10px] font-bold bg-red-950/30 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                                                    onClick={() => handleToggleScheduler('guru', false)}
                                                    disabled={isToggling === 'guru'}
                                                >
                                                    {isToggling === 'guru' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3 mr-1.5" />}
                                                    STOP AUTOMATION
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-8 text-[10px] font-bold bg-blue-950/30 text-blue-500 border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all"
                                                    onClick={() => handleToggleScheduler('guru', true)}
                                                    disabled={isToggling === 'guru'}
                                                >
                                                    {isToggling === 'guru' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-1.5" />}
                                                    START AUTOMATION
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                className="h-8 px-3 text-xs font-bold border border-gray-700 bg-transparent text-gray-300 hover:bg-blue-600 hover:text-white transition-all"
                                                onClick={() => handleTriggerRefresh('guru')}
                                                disabled={isTriggering}
                                                title="Force News Ingest"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 5. CONNECTIVITY MAP */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <Cloud className="h-4 w-4 text-gray-500" />
                                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Connectivity Map</h2>
                                </div>
                                <ConnectivityNode
                                    name="Database (Neon)"
                                    status={health?.db.status || "error"}
                                    label={`${health?.db.userCount || 0} Connected Users`}
                                    icon={Database}
                                />
                                <ConnectivityNode
                                    name="Zoho Integration"
                                    status={health?.zoho.status || "error"}
                                    label={health?.zoho.authenticated ? "Auth Token Valid" : "Auth Failed"}
                                    icon={Server}
                                />
                                <ConnectivityNode
                                    name="Provider Secret(s)"
                                    status={Object.values(health?.secrets || {}).every(s => s) ? "success" : "error"}
                                    label={`${Object.values(health?.secrets || {}).filter(s => s).length}/${Object.values(health?.secrets || {}).length} Verified`}
                                    icon={ShieldCheck}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
