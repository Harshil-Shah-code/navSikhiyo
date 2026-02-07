import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    slug: string;
    content: any; // HTML or JSON from TipTap
    category?: string;
    tags?: string[];
    image?: string;
    readingTime?: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        content: { type: Schema.Types.Mixed, required: true },
        category: { type: String },
        tags: { type: [String] },
        image: { type: String },
        readingTime: { type: Number },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Prevent overwrite of model if already compiled
const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
