export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface SentimentResult {
  polarity: "P" | "NEU" | "N" | null;
  confidence: number;
  subjectivity: string;
  irony: string;
}

export interface ArticleWithSentiment {
  id?: string;
  url: string;
  title: string;
  description: string | null;
  sourceName: string;
  sourceCountry: string | null;
  publishedAt: string;
  thumbnailUrl: string | null;
  sentiment: SentimentResult | null;
  isNew?: boolean;
}

export interface Brand {
  id: string;
  userId: string;
  name: string;
  searchQuery: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  brandName: string;
  alertType: string;
  deltaPct: number;
  createdAt: string;
  dismissedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  plan: "scout" | "intel";
  createdAt: string;
  lastVisitedAt: string | null;
}

export interface BrandWithData extends Brand {
  pressScore: number;
  articles: ArticleWithSentiment[];
  sparklineData: number[];
}
