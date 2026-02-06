import BlogForm from "@/components/admin/BlogForm";

export default function AddBlogPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <BlogForm />
            </div>
        </div>
    );
}
