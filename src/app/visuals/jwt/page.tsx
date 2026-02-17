import { Metadata } from 'next';
import { config } from "@/lib/config";
import { JwtVisual } from '@/components/visuals/jwtVisual';

export const metadata: Metadata = {
    title: `JWT Visual Guide - ${config.app.name}`,
    description: 'Interactive visual explanation of JSON Web Tokens (JWT). Learn how JWTs work, their structure, and security considerations through animated diagrams.',
};

export default function JwtPage() {
    return <JwtVisual />;
}
