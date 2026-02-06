"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import BlogCard from "./BlogCard";
import Filters from "./Filters";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BlogGrid() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [debouncedSearch] = useDebounce(search, 500);
    const { ref, inView } = useInView();

    const fetchBlogs = async ({ pageParam = 1 }) => {
        const res = await fetch(
            `/api/blogs?page=${pageParam}&limit=9&search=${debouncedSearch}&category=${category}`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["blogs", debouncedSearch, category],
        queryFn: fetchBlogs,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (status === "error") {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load blogs. Please try again later.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <Filters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {status === "pending" ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))
                ) : (
                    data?.pages.map((page) =>
                        page.blogs.map((blog: any) => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))
                    )
                )}
            </div>

            {status === 'success' && data.pages[0].blogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No articles found matching your criteria.
                </div>
            )}

            {/* Infinite Scroll Loader */}
            <div ref={ref} className="py-8 flex justify-center">
                {isFetchingNextPage && (
                    <div className="space-y-3 w-full max-w-sm">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mx-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}
