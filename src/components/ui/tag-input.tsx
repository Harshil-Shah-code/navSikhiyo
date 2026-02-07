"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    tags: string[];
    setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags, className, ...props }: TagInputProps) {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setInputValue("");
            }
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
            {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1 cursor-default">
                    {tag}
                    <button
                        type="button"
                        className="hover:bg-muted p-0.5 rounded-full cursor-pointer"
                        onClick={() => removeTag(tag)}
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                    </button>
                </Badge>
            ))}
            <Input
                {...props}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-0 focus-visible:ring-0 p-0 h-auto min-w-[100px]"
                placeholder="Type and press Enter..."
            />
        </div>
    );
}
