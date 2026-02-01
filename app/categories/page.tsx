"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Tags,
    Plus,
    Loader2,
    ChevronLeft,
    Tag
} from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchCategories();
        }
    }, [status, router]);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory }),
            });

            if (res.ok) {
                setNewCategory("");
                fetchCategories();
            }
        } catch (error) {
            console.error("Failed to add category", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex h-screen items-center justify-center translate-x-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="ml-64 min-h-screen p-8 bg-[#0a0a0a]">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/" className="rounded-xl border border-border p-2 hover:bg-accent transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage your expense labels</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Add New Category */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-fit">
                    <h2 className="mb-4 text-lg font-semibold">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Category Name</label>
                            <input
                                type="text"
                                required
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g. Entertainment"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Category"}
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Your Categories</h2>
                    <div className="grid gap-3">
                        {categories.map((cat: any) => (
                            <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border bg-accent/30 p-4 transition-colors hover:bg-accent/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary uppercase text-xs font-bold">
                                        {cat.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{cat.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{cat.type}</p>
                                    </div>
                                </div>
                                <Tag className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
