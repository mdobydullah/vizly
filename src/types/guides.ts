export interface ColorConfig {
  primary: string;
  background: string;
  border: string;
  hoverShadow: string;
}

export interface Contributor {
  username: string;
  name: string;
  bio: string;
  handles: {
    url: string;
  }[];
}

export interface Guide {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  readTime: string;
  icon: string;
  link: string;
  color: 'cyan' | 'purple' | 'blue' | 'green' | 'yellow' | 'pink';
  colorConfig: ColorConfig;
  createdAt: string;
  updatedAt: string;
  contributors?: Contributor[];
}

export interface GuidesData {
  guides: Guide[];
}

export type SortOption = 'newest' | 'oldest' | 'updated' | 'az' | 'za';
