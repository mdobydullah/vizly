import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { Guide } from '@/types/guides';

export async function GET(request: Request) {
    try {
        // API Key Protection
        const apiKey = request.headers.get('x-api-key');
        const secretKey = process.env.NEXT_PUBLIC_API_KEY;

        if (!apiKey || apiKey !== secretKey) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or missing API Key' }, { status: 401 });
        }

        const guidesDir = path.join(process.cwd(), 'src/data/guides');

        // Read all .json files in the directory
        const files = fs.readdirSync(guidesDir).filter(file => file.endsWith('.json'));

        let allGuides: Guide[] = [];

        for (const file of files) {
            const filePath = path.join(guidesDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            if (Array.isArray(data)) {
                allGuides = [...allGuides, ...data];
            }
        }

        return NextResponse.json({ guides: allGuides });
    } catch (error) {
        console.error('Error loading guides:', error);
        return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
    }
}
