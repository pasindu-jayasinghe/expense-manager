import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth-utils";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                currency: true,
                theme: true,
            } as any,
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Fetch user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, currency, theme, password, currentPassword } = body;

        const updatedData: any = {};
        if (name !== undefined) updatedData.name = name;
        // Email updates are not allowed for security reasons
        if (currency !== undefined) updatedData.currency = currency;
        if (theme !== undefined) updatedData.theme = theme;

        if (password) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Current password is required to set a new one" }, { status: 400 });
            }

            // Verify current password
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { password: true }
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            console.log("Password Change Debug:", {
                sessionId: session.user.id,
                hasUser: !!user,
                providedPassword: currentPassword,
            });

            const isPasswordValid = await comparePassword(currentPassword, user.password);
            const internalTestHash = await hashPassword("password123");
            const internalTestResult = await comparePassword("password123", internalTestHash);
            console.log("Bcrypt Debug:", {
                isPasswordValid,
                internalTestResult,
                userKeys: Object.keys(user),
                hashLength: user.password.length,
            });

            if (!isPasswordValid) {
                const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, password: true } });
                return NextResponse.json({
                    error: `Incorrect current password (InternalTest: ${internalTestResult}, Keys: ${Object.keys(user).join(',')}, HashLen: ${dbUser?.password.length})`
                }, { status: 400 });
            }

            updatedData.password = await hashPassword(password);
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updatedData,
        });

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                id: (user as any).id,
                email: (user as any).email,
                name: (user as any).name,
                currency: (user as any).currency,
                theme: (user as any).theme,
            },
        });
    } catch (error: any) {
        console.error("Update user error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
