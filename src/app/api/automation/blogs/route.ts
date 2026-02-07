import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';

export async function POST(request: Request) {
    try {
        // 1. Authentication Check
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (token !== process.env.API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // 2. Parse Request Body
        const data = await request.json();

        // Basic Validation
        if (!data.title || !data.content) {
            return NextResponse.json({ error: 'Missing required fields: title, content' }, { status: 400 });
        }

        await dbConnect();

        // 3. Generate Slug (if not provided)
        let slug = data.slug;
        if (!slug) {
            slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled';
        }

        // Ensure slug is unique
        let existing = await Blog.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        // Double check after modification
        existing = await Blog.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        // 4. Calculate Reading Time
        const words = (data.content || "").replace(/<[^>]+>/g, "").split(/\s+/).length;
        const readingTime = Math.ceil(words / 200);

        // 4.5 Handle Category (Find or Create)
        let categoryName = data.category || 'General';
        // Normalize category name (Capitalize first letter)
        categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        let categoryDoc = await Category.findOne({ slug: categorySlug });
        if (!categoryDoc) {
            try {
                categoryDoc = await Category.create({
                    name: categoryName,
                    slug: categorySlug
                });
                console.log(`Auto-created category: ${categoryName}`);
            } catch (catError) {
                console.warn(`Category creation failed (might exist): ${catError}`);
                // Fallback to finding it again in case of race condition
                categoryDoc = await Category.findOne({ slug: categorySlug });
            }
        }

        // 5. Create Blog Post
        const newBlog = await Blog.create({
            title: data.title,
            slug,
            content: data.content,
            category: categoryName, // Use the normalized/created category name
            tags: data.tags || [],
            image: data.image, // Optional image URL
            readingTime,
            isPublished: true, // Auto-publish by default for automation, or make it configurable
            // createdAt and updatedAt are handled by timestamps: true in schema
        });

        return NextResponse.json({
            success: true,
            message: 'Blog post created successfully',
            data: {
                id: newBlog._id,
                slug: newBlog.slug,
                url: `/blog/${newBlog.slug}` // Assumes this is the public URL structure
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Automation API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
