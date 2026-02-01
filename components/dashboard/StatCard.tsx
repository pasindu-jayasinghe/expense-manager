import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    className?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
    return (
        <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center gap-2">
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        trend.isUp ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                    )}>
                        {trend.isUp ? "+" : "-"}{trend.value}%
                    </span>
                    <span className="text-xs text-muted-foreground">from last month</span>
                </div>
            )}
        </div>
    );
}
