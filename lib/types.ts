export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'graphic' | 'motion' | 'ui-ux';
  images: string[];
  featured: boolean;
  createdAt: Date;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}