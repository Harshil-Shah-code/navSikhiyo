import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const { id } = params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
