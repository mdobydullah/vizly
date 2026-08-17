export type TheoryLevel = "junior" | "mid" | "senior";

export interface TheoryTopic {
    q: string;
    level: TheoryLevel;
    a: string[];
    example?: string;
    videoSrc?: string;
}

export interface TheorySection {
    id: string;
    title: string;
    track: string;
    topics: TheoryTopic[];
}
