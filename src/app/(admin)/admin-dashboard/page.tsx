import { getBlogs } from "@/app/actions/blog";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function AdminDashboardPage() {
    const { blogs } = await getBlogs(1, 100); // Fetch first 100 for now

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Recent Posts</h2>
                    <p className="text-sm text-muted-foreground">Manage your blog posts here.</p>
                </div>
                <DataTable columns={columns} data={blogs} />
            </div>
        </div>
    );
}
