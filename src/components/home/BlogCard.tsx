import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";

interface BlogCardProps {
    blog: {
        title: string;
        slug: string;
        content: string; // HTML string
        category?: string;
        createdAt: string;
        tags?: string[];
        image?: string;
    };
}

export default function BlogCard({ blog }: BlogCardProps) {
    // Strip HTML for excerpt
    const excerpt = blog.content.replace(/<[^>]+>/g, "").substring(0, 150) + "...";

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="p-0">
                <div className="h-48 w-full relative bg-slate-100 dark:bg-slate-900">
                    {(() => {
                        let isValidUrl = false;
                        try {
                            if (blog.image && (blog.image.startsWith('http') || blog.image.startsWith('/'))) {
                                new URL(blog.image, blog.image.startsWith('/') ? 'http://localhost:3000' : undefined);
                                isValidUrl = true;
                            }
                        } catch (e) {
                            isValidUrl = false;
                        }

                        return isValidUrl && blog.image ? (
                            <Image
                                src={blog.image}
                                alt={blog.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400">
                                <span className="text-4xl font-bold opacity-20 select-none">NavSikhyo</span>
                            </div>
                        );
                    })()}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    {blog.category && <Badge variant="secondary" className="capitalize">{blog.category}</Badge>}
                    <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {format(new Date(blog.createdAt), "MMM d, yyyy")}
                    </div>
                </div>

                <Link href={`/blog/${blog.slug}`} className="block group">
                    <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                    </h3>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {excerpt}
                </p>

                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {blog.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400">#{tag}</span>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-6 pt-0 mt-auto">
                <Link
                    href={`/blog/${blog.slug}`}
                    className="text-sm font-medium text-primary hover:underline hover:text-primary/80 inline-flex items-center"
                >
                    Read Article &rarr;
                </Link>
            </CardFooter>
        </Card>
    );
}
