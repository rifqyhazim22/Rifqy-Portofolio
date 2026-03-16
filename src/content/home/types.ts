export interface HomeAction {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}

export interface HomeHighlight {
  label: string;
  value: string;
}

export interface HomeLinkCard {
  href: string;
  title: string;
  sub: string;
}

export interface HomeHeroContent {
  name: string;
  title: string;
  tagline: string;
  summary: string;
  availability: string;
  actions: HomeAction[];
  highlights: HomeHighlight[];
  portraitSrc?: string;
  backgroundSrc?: string;
}

export interface HomePromo {
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface HomeSection {
  heading: string;
  items: HomeLinkCard[];
}

export interface HomeQuote {
  label: string;
  text: string;
}

export interface HomeContent {
  hero: HomeHeroContent;
  promo?: HomePromo;
  quote: HomeQuote;
  journey: HomeQuote;
  whatIDo: HomeSection;
}
