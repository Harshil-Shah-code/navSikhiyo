import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        const query: any = { isPublished: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
            ];
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title slug content category createdAt tags') // Select only necessary fields
            .lean();

        const total = await Blog.countDocuments(query);
        const hasMore = skip + blogs.length < total;

        return NextResponse.json({
            blogs,
            nextPage: hasMore ? page + 1 : undefined,
            total,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}
