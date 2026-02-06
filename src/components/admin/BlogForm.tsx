"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent } from "react";
import { createBlog, updateBlog } from "@/app/actions/blog";
import { toast } from "sonner";
import { useDirtyState } from "@/contexts/DirtyStateContext";
import { Loader2, Upload, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    slug: z.string().optional(),
    category: z.string().min(1, {
        message: "Category is required.",
    }),
    content: z.string().min(10, {
        message: "Content must be at least 10 characters.",
    }),
    tags: z.string().optional(), // Comma separated
    image: z.string().optional(),
});

interface BlogFormProps {
    initialData?: any;
}

export default function BlogForm({ initialData }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { setIsDirty } = useDirtyState();
    const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            category: initialData?.category || "",
            content: initialData?.content || "",
            tags: initialData?.tags?.join(", ") || "",
            image: initialData?.image || "",
        },
    });

    // Watch for changes to set dirty state
    useEffect(() => {
        const subscription = form.watch(() => setIsDirty(true));
        return () => subscription.unsubscribe();
    }, [form.watch, setIsDirty]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreviewImage(base64String);
                form.setValue("image", base64String, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPreviewImage(null);
        form.setValue("image", "", { shouldDirty: true });
    };

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
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
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="custom-url-slug" {...field} />
                                    </FormControl>
                                    <FormDescription>Leave empty to auto-generate from title.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <TipTapEditor content={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column: Sidebar (Category, Tags, Image) */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
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

                        <FormItem>
                            <FormLabel>Cover Image</FormLabel>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                {previewImage ? (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                        <Image
                                            src={previewImage}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                SVG, PNG, JPG or GIF
                                            </p>
                                        </div>
                                    </>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className={previewImage ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
                                    onChange={handleImageChange}
                                    disabled={!!previewImage} // Disable input when image exists to prevent double dialog
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
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
