"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote } from "lucide-react";
import { useEffect } from 'react';

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border rounded-md dark:prose-invert max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update content if changed externally (e.g. initial load)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Only set content if it's different to avoid cursor jumps or loops.
            // For simple use cases, this valid specific check is hard.
            // We'll assume content is initialData and doesn't change from outside often.
            // A better way is to only set content if editor is empty.
            if (editor.isEmpty) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);


    if (!editor) {
        return null;
    }

    return (
        <div className="space-y-2 border rounded-md p-2 bg-background">
            <div className="flex flex-wrap gap-1 border-b pb-2 mb-2">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 1 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="h-4 w-4" />
                </Toggle>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
