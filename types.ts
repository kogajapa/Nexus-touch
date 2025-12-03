import { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  features: string[];
  imageUrl: string;
  videoUrl?: string;
  alternateVideoUrl?: string;
  gallery?: string[];
  category: 'indoor' | 'outdoor' | 'table' | 'ai-solution';
  specs?: Record<string, string>;
  caseStudy?: {
    title: string;
    content: string;
    chatTranscript?: Array<{ role: 'user' | 'bot'; text: string }>;
  };
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
}
