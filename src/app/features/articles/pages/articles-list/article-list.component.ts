import {
    Component,
    signal,
    computed,
    effect,
    inject,
    ChangeDetectionStrategy,
    EffectRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, map } from 'rxjs';
import { ArticlesFilterComponent } from './components/articles-filter/articles-filter.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticleService } from '../../services/article.service';
import { GetArticleRequest } from '../../models/article.model';
import { Router } from '@angular/router';

export function splitKeywords(
    searchInput: string | null | undefined
): string[] {
    return (searchInput || '')
        .split(/[\s,]+/)
        .map((k) => k.trim())
        .filter((k) => !!k);
}

export function countOccurrences(haystack: string, needle: string): number {
    if (!haystack || !needle) return 0;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    return (haystack.match(regex) || []).length;
}

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [CommonModule, ArticlesFilterComponent, ArticleCardComponent],
    templateUrl: './article-list.component.html',
    styleUrl: './article-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
    private readonly articleService = inject(ArticleService);
    private readonly router = inject(Router);
    private readonly searchEffect: EffectRef;

    highlightKeywords = computed(() => splitKeywords(this.searchTerm()));

    rankedArticles = computed(() => {
        const articles: GetArticleRequest[] = this.articles();
        const lowercasedKeywords: string[] = this.highlightKeywords().map(
            (keyword: string) => keyword.toLowerCase()
        );
        if (lowercasedKeywords.length === 0) return articles;

        const withScores = articles.map((a) => {
            const title = a.title.toLowerCase();
            const summary = (a.summary || '').toLowerCase();
            let titleOccurrences = 0;
            let summaryOccurrences = 0;
            for (const term of lowercasedKeywords) {
                titleOccurrences += countOccurrences(title, term);
                summaryOccurrences += countOccurrences(summary, term);
            }
            return { a, titleOccurrences, summaryOccurrences };
        });

        withScores.sort((x, y) => {
            if (y.titleOccurrences !== x.titleOccurrences) {
                return y.titleOccurrences - x.titleOccurrences;
            }
            if (y.summaryOccurrences !== x.summaryOccurrences) {
                return y.summaryOccurrences - x.summaryOccurrences;
            }
            return 0;
        });

        return withScores.map((w) => w.a);
    });

    isLoading = signal(false);
    error = signal<string | null>(null);
    resultsCount = computed(() => this.rankedArticles().length);

    private articles = signal<GetArticleRequest[]>([]);

    private searchSubject = new Subject<string>();

    private searchTerm = toSignal(
        this.searchSubject.pipe(
            debounceTime(300),
            map((value: string) => splitKeywords(value || '').join(' ')),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    constructor() {
        this.searchEffect = effect(() => {
            const currentSearchInput: string = this.searchTerm();
            this.loadArticles(currentSearchInput);
        });
    }

    onSearch(searchValue: string) {
        this.searchSubject.next(searchValue);
    }

    onCardClick(articleId: number) {
        this.router.navigate(['/articles', articleId]);
    }

    retryLoad() {
        this.loadArticles();
    }

    private loadArticles(searchInput?: string) {
        this.isLoading.set(true);
        this.error.set(null);

        const keywords: string[] = splitKeywords(searchInput || '');
        const commaSeparatedKeywords: string = keywords.join(',');

        this.articleService
            .getArticles(
                keywords.length
                    ? {
                          search: commaSeparatedKeywords,
                      }
                    : undefined
            )
            .subscribe({
                next: (response) => {
                    this.articles.set(response.results);
                },
                error: (err) => {
                    console.error('Failed to load articles', err);
                    this.error.set(
                        'Could not fetch articles. Please try again later.'
                    );
                    this.articles.set([]);
                },
                complete: () => {
                    this.isLoading.set(false);
                },
            });
    }
}
