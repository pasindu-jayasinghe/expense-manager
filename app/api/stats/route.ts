import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const expenses = await prisma.expense.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                category: true,
            },
        });

        const totalSpent = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

        // Category-wise breakdown
        const categoryBreakdown = expenses.reduce((acc: Record<string, number>, exp: any) => {
            const catName = exp.category.name;
            acc[catName] = (acc[catName] || 0) + Number(exp.amount);
            return acc;
        }, {});

        // Last 6 months trend (simplified for MVP)
        const monthlyData = expenses.reduce((acc: Record<string, number>, exp: any) => {
            const month = exp.date.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + Number(exp.amount);
            return acc;
        }, {});

        return NextResponse.json({
            totalSpent,
            categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
            monthlyData: Object.entries(monthlyData).map(([name, total]) => ({ name, total })),
        });
    } catch (error) {
        console.error("Fetch stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
