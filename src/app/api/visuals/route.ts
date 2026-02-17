import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { Visual } from '@/types/visuals';

export async function GET(request: Request) {
    try {
        // API Key Protection
        const apiKey = request.headers.get('x-api-key');
        const secretKey = process.env.NEXT_PUBLIC_API_KEY;

        if (!apiKey || apiKey !== secretKey) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or missing API Key' }, { status: 401 });
        }

        const visualsDir = path.join(process.cwd(), 'src/data/visuals');

        // Read all .json files in the directory
        const files = fs.readdirSync(visualsDir).filter(file => file.endsWith('.json'));

        let allVisuals: Visual[] = [];

        for (const file of files) {
            const filePath = path.join(visualsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            if (Array.isArray(data)) {
                allVisuals = [...allVisuals, ...data];
            }
        }

        return NextResponse.json({ visuals: allVisuals });
    } catch (error) {
        console.error('Error loading visuals:', error);
        return NextResponse.json({ error: 'Failed to load visuals' }, { status: 500 });
    }
}
