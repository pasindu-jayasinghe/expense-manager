"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    Loader2,
    ChevronLeft
} from "lucide-react";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ExpensesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for filters
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");

    // UI States
    const [showForm, setShowForm] = useState(searchParams.get("add") === "true");
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.set("search", search);
            if (categoryId) queryParams.set("categoryId", categoryId);

            const res = await fetch(`/api/expenses?${queryParams.toString()}`);
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    }, [search, categoryId]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchExpenses();
            fetchCategories();
        }
    }, [status, router, fetchExpenses]);

    const handleAddOrUpdate = async (data: any) => {
        const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
        const method = editingExpense ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                fetchExpenses();
                setShowForm(false);
                setEditingExpense(null);
            }
        } catch (error) {
            console.error("Failed to save expense", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;

        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) fetchExpenses();
        } catch (error) {
            console.error("Failed to delete expense", error);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center translate-x-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="ml-64 min-h-screen p-8 bg-[#0a0a0a]">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="rounded-xl border border-border p-2 hover:bg-accent transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Expenses</h1>
                        <p className="text-muted-foreground">List and filter all your transactions</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                    <Plus className="h-4 w-4" />
                    Add Expense
                </button>
            </div>

            <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-border bg-card px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <ExpenseList
                expenses={expenses}
                onEdit={(exp) => {
                    setEditingExpense(exp);
                    setShowForm(true);
                }}
                onDelete={handleDelete}
            />

            {showForm && (
                <ExpenseForm
                    initialData={editingExpense}
                    onClose={() => {
                        setShowForm(false);
                        setEditingExpense(null);
                        router.replace("/expenses");
                    }}
                    onSubmit={handleAddOrUpdate}
                />
            )}

            {loading && (
                <div className="fixed bottom-8 right-8 animate-pulse bg-primary/10 px-4 py-2 rounded-full border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-widest">
                    Syncing...
                </div>
            )}
        </div>
    );
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center translate-x-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ExpensesContent />
        </Suspense>
    );
}
