export interface Author {
    name: string;
    socials: string[] | null;
}

export interface Launch {
    launch_id: string;
    provider: string;
}

export interface GetArticleRequest {
    id: number;
    title: string;
    authors: Author[];
    url: string;
    image_url: string;
    news_site: string;
    summary: string;
    published_at: string;
    updated_at: string;
    featured: boolean;
    launches: Launch[];
    events: unknown[];
}
