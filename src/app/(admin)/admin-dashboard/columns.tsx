"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileEdit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertModal } from "@/components/modals/AlertModal";
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
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];

interface CellActionProps {
    data: BlogData;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleTogglePublish = async () => {
        try {
            await togglePublish(data._id, !data.isPublished);
            toast.success(data.isPublished ? "Unpublished" : "Published");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await deleteBlog(data._id);
            toast.success("Blog deleted");
            // The router refresh or data revalidation should handle the UI update
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
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
                        <Link href={`/admin-dashboard/edit/${data._id}`} className="flex items-center cursor-pointer">
                            <FileEdit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleTogglePublish} className="cursor-pointer">
                        {data.isPublished ? (
                            <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</>
                        ) : (
                            <><Eye className="mr-2 h-4 w-4" /> Publish</>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600 focus:text-red-600 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
