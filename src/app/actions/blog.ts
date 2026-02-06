"use server";

import dbConnect from "@/lib/mongodb";
import Blog, { IBlog } from "@/models/Blog";
import { revalidatePath } from "next/cache";

// Helper to serialize Mongoose docs
function serialize(doc: any) {
    return JSON.parse(JSON.stringify(doc));
}

export async function getBlogs(page = 1, limit = 10) {
    await dbConnect();

    const skip = (page - 1) * limit;

    const blogs = await Blog.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Blog.countDocuments({});

    return {
        blogs: serialize(blogs),
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    };
}

export async function deleteBlog(id: string) {
    await dbConnect();
    await Blog.findByIdAndDelete(id);
    revalidatePath('/admin-dashboard');
    revalidatePath('/'); // Update home page too
    return { success: true };
}

export async function togglePublish(id: string, isPublished: boolean) {
    await dbConnect();
    await Blog.findByIdAndUpdate(id, { isPublished });
    revalidatePath('/admin-dashboard');
    revalidatePath('/');
    return { success: true };
}

export async function createBlog(data: Partial<IBlog>) {
    await dbConnect();

    // Ensure slug is unique
    let slug = data.slug;
    if (!slug) {
        slug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled';
    }

    // Simple check for duplicate slug
    const existing = await Blog.findOne({ slug });
    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    const blog = await Blog.create({ ...data, slug });
    revalidatePath('/admin-dashboard');
    revalidatePath('/');
    return { success: true, id: blog._id.toString() };
}

export async function updateBlog(id: string, data: Partial<IBlog>) {
    await dbConnect();
    await Blog.findByIdAndUpdate(id, data);
    revalidatePath('/admin-dashboard');
    revalidatePath('/');
    return { success: true };
}

export async function getBlogById(id: string) {
    await dbConnect();
    const blog = await Blog.findById(id).lean();
    if (!blog) return null;
    return serialize(blog);
}
