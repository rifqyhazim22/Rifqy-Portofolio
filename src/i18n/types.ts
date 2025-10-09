export interface LinkCard {
  href: string;
  title: string;
  sub: string;
}

export interface PillLink {
  href: string;
  label: string;
}

export interface UpdateItem {
  href: string;
  title: string;
  summary: string;
}

export interface UpdateDetailSection {
  heading: string;
  body: string;
}

export interface UpdateDetail {
  title: string;
  date: string;
  intro: string;
  sections: UpdateDetailSection[];
  grids?: Array<{ heading: string; items: LinkCard[] }>;
}

export interface IndustryDetail {
  title: string;
  intro: string;
  mindsetHeading: string;
  mindsetBody: string;
  examplesHeading: string;
  examples: LinkCard[];
  actionsHeading: string;
  actions: LinkCard[];
}

export interface LearningCard {
  id: string;
  title: string;
  points: Array<{ title: string; body: string }>;
}
