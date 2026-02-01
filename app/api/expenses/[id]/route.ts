import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { amount, description, date, categoryId, attachmentUrl } = await req.json();

        const existingExpense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existingExpense || existingExpense.userId !== session.user.id) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount }),
                ...(description !== undefined && { description }),
                ...(date !== undefined && { date: new Date(date) }),
                ...(categoryId !== undefined && { categoryId }),
                ...(attachmentUrl !== undefined && { attachmentUrl }),
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(updatedExpense);
    } catch (error) {
        console.error("Update expense error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existingExpense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existingExpense || existingExpense.userId !== session.user.id) {
            return NextResponse.json({ error: "Expense not found" }, { status: 404 });
        }

        await prisma.expense.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error("Delete expense error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
