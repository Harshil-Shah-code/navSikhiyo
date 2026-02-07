import { MetadataRoute } from 'next'
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await dbConnect();
    const blogs = await Blog.find({ isPublished: true }, { slug: 1, updatedAt: 1 }).lean();

    const blogEntries: MetadataRoute.Sitemap = blogs.map((blog: any) => ({
        url: `https://nav-sikhiyo.vercel.app/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: 'https://nav-sikhiyo.vercel.app',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...blogEntries,
    ]
}
