import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/auth-utils";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isValid = await comparePassword(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: (user as any).id,
                    email: (user as any).email,
                    name: (user as any).name,
                    role: (user as any).role,
                    currency: (user as any).currency,
                    theme: (user as any).theme,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.currency = (user as any).currency;
                token.theme = (user as any).theme;
            }
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.currency = session.user.currency;
                token.theme = session.user.theme;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.currency = token.currency as string;
                session.user.theme = token.theme as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
