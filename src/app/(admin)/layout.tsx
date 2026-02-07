"use client";

import { DirtyStateProvider } from "@/contexts/DirtyStateContext";
import AdminLayoutContent from "@/components/admin/AdminLayoutContent";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DirtyStateProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </DirtyStateProvider>
    );
}
