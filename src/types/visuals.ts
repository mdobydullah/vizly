export interface ColorConfig {
  primary: string;
  background: string;
  border: string;
  hoverShadow: string;
}

export interface Visual {
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
}

export interface VisualsData {
  visuals: Visual[];
}

export type SortOption = 'newest' | 'oldest' | 'updated' | 'az' | 'za';
