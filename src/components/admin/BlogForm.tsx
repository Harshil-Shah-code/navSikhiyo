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
import { Loader2, Upload, X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { TagInput } from "@/components/ui/tag-input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
});

interface BlogFormProps {
    initialData?: any;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
}

export default function BlogForm({ initialData }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { setIsDirty } = useDirtyState();
    const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null);

    // Category states
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            category: initialData?.category || "",
            content: initialData?.content || "",
            tags: initialData?.tags || [],
            image: initialData?.image || "",
        },
    });

    // Watch for changes to set dirty state
    useEffect(() => {
        const subscription = form.watch(() => setIsDirty(true));
        return () => subscription.unsubscribe();
    }, [form.watch, setIsDirty]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        setIsCreatingCategory(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName }),
            });

            if (res.ok) {
                const newCategory = await res.json();
                setCategories(prev => [...prev, newCategory]);
                form.setValue("category", newCategory.name, { shouldDirty: true }); // Auto-select new category
                toast.success("Category created!");
                setIsAddCategoryOpen(false);
                setNewCategoryName("");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to create category");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsCreatingCategory(false);
        }
    };

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
                tags: values.tags || [],
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
        <>
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs text-primary hover:text-primary/90 cursor-pointer"
                                                onClick={() => setIsAddCategoryOpen(true)}
                                            >
                                                <Plus className="mr-1 h-3 w-3" /> Add New
                                            </Button>
                                        </div>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full cursor-pointer">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category._id || category.name} value={category.name} className="cursor-pointer">
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                                {categories.length === 0 && (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No categories found. Add one!
                                                    </div>
                                                )}
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
                                            <TagInput
                                                tags={field.value || []}
                                                setTags={field.onChange}
                                                placeholder="Type and enter..."
                                            />
                                        </FormControl>
                                        <FormDescription>Press Enter or Comma to add tags.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormItem>
                                <FormLabel>Cover Image</FormLabel>
                                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                                                className="absolute top-2 right-2 h-8 w-8 cursor-pointer"
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
                                        disabled={!!previewImage}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">Cancel</Button>
                        <Button type="submit" disabled={loading} className="cursor-pointer">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Update Post" : "Create Post"}
                        </Button>
                    </div>
                </form>
            </Form>

            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a new category for your blog posts.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                                placeholder="e.g. Technology"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)} className="cursor-pointer">Cancel</Button>
                        <Button onClick={handleCreateCategory} disabled={isCreatingCategory || !newCategoryName.trim()} className="cursor-pointer">
                            {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
