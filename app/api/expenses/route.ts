import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    try {
        const expenses = await prisma.expense.findMany({
            where: {
                userId: session.user.id,
                ...(categoryId && { categoryId }),
                ...(startDate && endDate && {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
                ...(search && {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                }),
            },
            include: {
                category: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("Fetch expenses error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, description, date, categoryId, attachmentUrl } = await req.json();

        if (!amount || !description || !date || !categoryId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                amount,
                description,
                date: new Date(date),
                categoryId,
                userId: session.user.id,
                attachmentUrl,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error("Create expense error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
