import { Pipe, PipeTransform } from '@angular/core';
import { GetArticleRequest } from '../../features/articles/models/article.model';

function buildSafeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Pipe({
    name: 'rankByKeywords',
    standalone: true,
    pure: true,
})
export class RankByKeywordsPipe implements PipeTransform {
    transform(
        articles: GetArticleRequest[],
        keywords: string[]
    ): GetArticleRequest[] {
        const lowercasedKeywords: string[] = keywords.map((k) =>
            k.toLowerCase()
        );

        if (lowercasedKeywords.length === 0) {
            return articles;
        }

        return articles
            .map((article) => {
                const title = article.title.toLowerCase();
                const summary = article.summary.toLowerCase();

                let titleMatches = 0;
                let summaryMatches = 0;

                for (const keyword of lowercasedKeywords) {
                    const regex = new RegExp(buildSafeRegex(keyword), 'gi');
                    titleMatches += (title.match(regex) || []).length;
                    summaryMatches += (summary.match(regex) || []).length;
                }

                return { article, titleMatches, summaryMatches };
            })
            .sort(
                (x, y) =>
                    y.titleMatches - x.titleMatches ||
                    y.summaryMatches - x.summaryMatches
            )
            .map((x) => x.article);
    }
}
