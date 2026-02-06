import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const blog = await Blog.findOne({ slug, isPublished: true });

    if (!blog) return { title: 'Post Not Found' };

    return {
        title: `${blog.title} | NavSikhyo`,
        description: blog.content.substring(0, 160).replace(/<[^>]+>/g, ""),
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    await dbConnect();

    const blog = await Blog.findOne({ slug, isPublished: true }).lean();

    if (!blog) {
        notFound();
    }

    // Calculate read time (rough estimate)
    const words = blog.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    const readTime = Math.ceil(words / 200);

    return (
        <article className="min-h-screen bg-white dark:bg-slate-950 font-[family-name:var(--font-geist-sans)] pb-20">
            {/* Header */}
            <header className="bg-slate-50 dark:bg-slate-900 border-b py-12">
                <div className="container mx-auto px-4 max-w-3xl space-y-4">
                    <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Home
                    </Link>

                    <div className="flex gap-2 mb-4">
                        {blog.category && <Badge variant="secondary" className="capitalize">{blog.category}</Badge>}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(new Date(blog.createdAt), "MMMM d, yyyy")}
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {readTime} min read
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Container */}
            <main className="container mx-auto px-4 max-w-3xl py-8">
                {/* Blog Image */}
                {blog.image && (
                    <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-900">
                        <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {blog.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                                #{tag.trim()}
                            </Badge>
                        ))}
                    </div>
                )}

                <div
                    className="prose prose-lg dark:prose-invert prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight 
                    prose-a:text-primary prose-img:rounded-xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </main>
        </article>
    );
}
