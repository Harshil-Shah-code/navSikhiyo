import BlogForm from "@/components/admin/BlogForm";
import { getBlogById } from "@/app/actions/blog";
import { notFound } from "next/navigation";

interface EditBlogPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
    const { id } = await params;
    const blog = await getBlogById(id);

    if (!blog) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <BlogForm initialData={blog} />
            </div>
        </div>
    );
}
