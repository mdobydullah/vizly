import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { Guide } from '@/types/guides';

/** Recursively collect all .json file paths under a directory, excluding guide-colors.json */
function collectJsonFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectJsonFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'guide-colors.json') {
            files.push(fullPath);
        }
    }

    return files;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const take = Math.max(1, Number.parseInt(searchParams.get('take') ?? '20', 10));
        const skip = Math.max(0, Number.parseInt(searchParams.get('skip') ?? '0', 10));
        // status: "active" | "upcoming" | "all" (default: "all")
        const status = searchParams.get('status') ?? 'all';

        const guidesDir = path.join(process.cwd(), 'src/data/guides');

        // Recursively find all category JSON files (skips guide-colors.json)
        const files = collectJsonFiles(guidesDir);

        let allGuides: Guide[] = [];

        for (const filePath of files) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            if (Array.isArray(data)) {
                allGuides = [...allGuides, ...data];
            }
        }

        // Split into active and upcoming
        const isUpcoming = (g: Guide) => g.link === '#';
        const active = allGuides.filter(g => !isUpcoming(g));
        const upcoming = allGuides.filter(g => isUpcoming(g));

        // Active guides: sort by createdAt descending (newest first)
        const byDateDesc = (a: Guide, b: Guide) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        active.sort(byDateDesc);

        // Build ordered list based on status filter
        let ordered: Guide[];
        if (status === 'active') {
            ordered = active;
        } else if (status === 'upcoming') {
            ordered = upcoming;
        } else {
            // "all": active first (newest → oldest), upcoming always at the end
            ordered = [...active, ...upcoming];
        }

        const total = ordered.length;
        const guides = ordered.slice(skip, skip + take);

        return NextResponse.json({ total, skip, take, guides });
    } catch (error) {
        console.error('Error loading guides:', error);
        return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
    }
}

