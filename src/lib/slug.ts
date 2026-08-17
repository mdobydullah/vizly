// Shared slug for theory topic deep links, e.g. "Process vs Thread" -> "process-vs-thread"
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
