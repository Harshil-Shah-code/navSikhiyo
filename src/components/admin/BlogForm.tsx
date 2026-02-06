"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createBlog, updateBlog } from "@/app/actions/blog";
import { toast } from "sonner";
import { useDirtyState } from "@/contexts/DirtyStateContext";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    slug: z.string().optional(),
    category: z.string().optional(),
    content: z.string().min(10, {
        message: "Content must be at least 10 characters.",
    }),
    tags: z.string().optional(), // Comma separated
});

interface BlogFormProps {
    initialData?: any;
}

export default function BlogForm({ initialData }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { setIsDirty } = useDirtyState();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            category: initialData?.category || "",
            content: initialData?.content || "",
            tags: initialData?.tags?.join(", ") || "",
        },
    });

    // Watch for changes to set dirty state
    useEffect(() => {
        const subscription = form.watch(() => setIsDirty(true));
        return () => subscription.unsubscribe();
    }, [form.watch, setIsDirty]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const data = {
                ...values,
                tags: values.tags ? values.tags.split(",").map((t) => t.trim()) : [],
            };

            let result;
            if (initialData?._id) {
                result = await updateBlog(initialData._id, data);
            } else {
                result = await createBlog(data);
            }

            if (result.success) {
                setIsDirty(false); // Clear dirty state before navigation
                toast.success(initialData ? "Post updated!" : "Post created!");
                router.push("/admin-dashboard");
                router.refresh();
            } else {
                toast.error("Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Blog post title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="custom-url-slug" {...field} />
                                </FormControl>
                                <FormDescription>Leave empty to auto-generate from title.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                        <SelectItem value="coding">Coding</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <Input placeholder="react, nextjs, tutorial" {...field} />
                                </FormControl>
                                <FormDescription>Comma separated values.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <TipTapEditor content={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Post" : "Create Post"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
