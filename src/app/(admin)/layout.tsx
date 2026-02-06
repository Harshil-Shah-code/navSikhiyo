"use client";

import { useSessionCleanup } from "@/hooks/useSessionCleanup";
import { DirtyStateProvider } from "@/contexts/DirtyStateContext";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, LogOut, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useSessionCleanup();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/nav-portal-login");
            router.refresh(); // Clear client cache
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    return (
        <DirtyStateProvider>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            NavSikhyo
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <Link href="/admin-dashboard">
                            <Button variant="ghost" className="w-full justify-start">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/admin-dashboard/add">
                            <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/90 hover:bg-primary/10">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Post
                            </Button>
                        </Link>
                        <Link href="/" target="_blank">
                            <Button variant="ghost" className="w-full justify-start">
                                <Globe className="mr-2 h-4 w-4" />
                                View Live Site
                            </Button>
                        </Link>
                    </nav>

                    <div className="p-4 border-t space-y-2">
                        <div className="flex items-center p-2 rounded-md bg-slate-100 dark:bg-slate-800 mb-2">
                            <div className="rounded-full bg-primary h-8 w-8 flex items-center justify-center text-white mr-3">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">Admin User</p>
                                <p className="text-xs text-muted-foreground">Super Admin</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto h-screen">
                    <div className="container mx-auto p-6 md:p-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </DirtyStateProvider>
    );
}
