"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileEdit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { deleteBlog, togglePublish } from "@/app/actions/blog";
import { toast } from "sonner";

// Define the shape of our data.
export type BlogData = {
    _id: string;
    title: string;
    slug: string;
    category: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
};

export const columns: ColumnDef<BlogData>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("category") || "Uncategorized"}</Badge>,
    },
    {
        accessorKey: "isPublished",
        header: "Status",
        cell: ({ row }) => {
            const isPublished = row.getValue("isPublished");
            return (
                <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Published" : "Draft"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            return <div className="text-muted-foreground text-sm">{format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const blog = row.original;

            const handleTogglePublish = async () => {
                try {
                    await togglePublish(blog._id, !blog.isPublished);
                    toast.success(blog.isPublished ? "Unpublished" : "Published");
                } catch (error) {
                    toast.error("Failed to update status");
                }
            };

            const handleDelete = async () => {
                if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
                    try {
                        await deleteBlog(blog._id);
                        toast.success("Blog deleted");
                    } catch (error) {
                        toast.error("Failed to delete");
                    }
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin-dashboard/edit/${blog._id}`} className="flex items-center cursor-pointer">
                                <FileEdit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleTogglePublish} className="cursor-pointer">
                            {blog.isPublished ? (
                                <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</>
                            ) : (
                                <><Eye className="mr-2 h-4 w-4" /> Publish</>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
