import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expensely | Smart Expense ManagerXX",
  description: "Manage your expenses with style and precision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <div className="relative flex min-h-screen">
            <Sidebar />
            <main className="flex-1 transition-all duration-300 ease-in-out">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
