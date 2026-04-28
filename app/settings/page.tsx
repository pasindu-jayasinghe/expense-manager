"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Wallet,
    Palette,
    Shield,
    Check,
    Loader2,
    Lock,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const themes = [
    { id: "dark", name: "Dark", icon: Palette },
    { id: "light", name: "Light (Coming Soon)", icon: Palette, disabled: true },
];

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        currency: "USD",
        theme: "dark",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
                currency: session.user.currency || "USD",
                theme: session.user.theme || "dark",
            });
            setLoading(false);
        }
    }, [status, session, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                // Update session to reflect changes without reload
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: formData.name,
                        currency: formData.currency,
                        theme: formData.theme,
                    }
                });
                router.refresh();
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update profile" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    password: passwordData.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordSuccess(true);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => setShowPasswordModal(false), 2000);
            } else {
                setPasswordError(data.error || "Failed to update password");
            }
        } catch (error) {
            setPasswordError("An error occurred. Please try again.");
        } finally {
            setSaving(false);
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
        <div className="ml-64 min-h-screen p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and app preferences</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Section */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Profile Settings</h2>
                            <p className="text-sm text-muted-foreground">Your basic account information</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    disabled
                                    className="w-full rounded-xl border border-border bg-accent/30 px-10 py-2.5 text-sm text-muted-foreground cursor-not-allowed outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">App Preferences</h2>
                            <p className="text-sm text-muted-foreground">Customize your experience</p>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Primary Currency</label>
                            <div className="grid grid-cols-2 gap-3">
                                {currencies.map((curr) => (
                                    <button
                                        key={curr.code}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, currency: curr.code })}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl border p-3 text-left transition-all",
                                            formData.currency === curr.code
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border bg-background hover:bg-accent"
                                        )}
                                    >
                                        <span className="text-lg font-bold">{curr.symbol}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{curr.code}</span>
                                            <span className="text-[10px] text-muted-foreground">{curr.name}</span>
                                        </div>
                                        {formData.currency === curr.code && (
                                            <Check className="ml-auto h-4 w-4" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium">Appearance</label>
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        disabled={theme.disabled}
                                        onClick={() => !theme.disabled && setFormData({ ...formData, theme: theme.id })}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                                            formData.theme === theme.id
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border bg-background hover:bg-accent",
                                            theme.disabled && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <theme.icon className="h-5 w-5" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{theme.name}</span>
                                        </div>
                                        {formData.theme === theme.id && (
                                            <Check className="ml-auto h-4 w-4" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Security Section */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Security</h2>
                            <p className="text-sm text-muted-foreground">Manage your credentials</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border">
                        <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Change Password</p>
                                <p className="text-xs text-muted-foreground">Regularly update your password for security</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </section>

                {/* Save Footer */}
                <div className="flex items-center justify-between border-t border-border pt-8">
                    {message && (
                        <div className={cn(
                            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm",
                            message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                        )}>
                            {message.type === "success" && <Check className="h-4 w-4" />}
                            {message.text}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </form>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="p-1 rounded-lg hover:bg-accent transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="••••••••"
                                />
                            </div>

                            {passwordError && (
                                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{passwordError}</p>
                            )}
                            {passwordSuccess && (
                                <p className="text-sm text-green-500 bg-green-500/10 p-3 rounded-lg flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Password updated successfully!
                                </p>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
