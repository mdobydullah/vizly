export interface Job {
    id: string;
    title: string;
    url: string;
    description: string;
    category: string;
}

export interface JobsData {
    jobs: Job[];
}

// Dynamically load all .json files in this folder and subfolders
const context = (require as any).context('./', true, /\.json$/);

const allJobs: Job[] = context.keys()
    .flatMap((key: string) => {
        const jobs = context(key);
        return jobs as Job[];
    });

export const jobsData: JobsData = {
    jobs: allJobs
};

export default jobsData;
