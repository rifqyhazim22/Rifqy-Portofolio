export interface AboutHero {
  title: string;
  tagline: string;
  summary: string;
}

export interface AboutStory {
  heading: string;
  paragraphs: string[];
}

export interface AboutPhilosophy {
  heading: string;
  paragraphs: string[];
}

export interface TimelineItem {
  id: string;
  period: string;
  title: string;
  description: string;
}

export interface CapabilityCluster {
  title: string;
  description: string;
  items: string[];
}

export interface ValueItem {
  title: string;
  body: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
}

export interface AboutContent {
  hero: AboutHero;
  philosophy: AboutPhilosophy;
  story: AboutStory;
  timeline: {
    heading: string;
    items: TimelineItem[];
  };
  capabilities: {
    heading: string;
    clusters: CapabilityCluster[];
  };
  values: {
    heading: string;
    items: ValueItem[];
  };
  testimonials: {
    heading: string;
    items: TestimonialItem[];
    cta: { label: string; href: string };
  };
}
