"use client";

import { Trash2, Edit2, Calendar, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Expense {
    id: string;
    amount: string;
    description: string;
    date: string;
    category: { name: string };
    categoryId: string;
}

interface ExpenseListProps {
    expenses: Expense[];
    currency?: string;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, currency, onEdit, onDelete }: ExpenseListProps) {
    if (expenses.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No expenses found matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="transition-colors hover:bg-accent/50 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {new Date(expense.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                                    {expense.description}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                        <Tag className="h-2.5 w-2.5" />
                                        {expense.category.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-base">
                                    {formatCurrency(expense.amount, currency)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => onEdit(expense)}
                                            className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
