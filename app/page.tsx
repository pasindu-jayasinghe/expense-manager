"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  Loader2
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ExpenseCharts from "@/components/dashboard/ExpenseCharts";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}</p>
        </div>
        <Link
          href="/expenses?add=true"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <StatCard
          label="Total Balance"
          value={formatCurrency(12450.00)}
          icon={Wallet}
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(stats?.totalSpent || 0)}
          icon={CreditCard}
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          label="Savings"
          value={formatCurrency(8450.00)}
          icon={TrendingUp}
        />
      </div>

      <ExpenseCharts
        monthlyData={stats?.monthlyData || []}
        categoryData={stats?.categoryBreakdown || []}
      />

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/expenses" className="p-4 rounded-xl bg-accent/50 border border-border hover:bg-accent transition-colors text-center">
            <p className="text-sm font-medium">View All</p>
          </Link>
          <Link href="/categories" className="p-4 rounded-xl bg-accent/50 border border-border hover:bg-accent transition-colors text-center">
            <p className="text-sm font-medium">Manage Categories</p>
          </Link>
          <button className="p-4 rounded-xl bg-accent/50 border border-border hover:bg-accent transition-colors text-center">
            <p className="text-sm font-medium">Export CSV</p>
          </button>
          <button className="p-4 rounded-xl bg-accent/50 border border-border hover:bg-accent transition-colors text-center">
            <p className="text-sm font-medium">Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}
