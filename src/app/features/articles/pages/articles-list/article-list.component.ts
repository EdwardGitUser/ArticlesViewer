import {
    Component,
    signal,
    computed,
    inject,
    ChangeDetectionStrategy,
    OnInit,
    DestroyRef,
    untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    debounceTime,
    distinctUntilChanged,
    Subject,
    map,
    startWith,
    switchMap,
    tap,
    catchError,
    finalize,
    of,
} from 'rxjs';
import { ArticlesFilterComponent } from './components/articles-filter/articles-filter.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArticleService } from '../../services/article.service';
import { GetArticleRequest } from '../../models/article.model';
import { Router } from '@angular/router';

export function splitKeywords(
    searchInput: string | null | undefined
): string[] {
    return (searchInput ?? '')
        .split(/[\s,]+/)
        .map((k: string) => k.trim())
        .filter((k: string) => !!k);
}

export function countMatchesInText(text: string, keyword: string): number {
    if (!text || !keyword) return 0;
    const regexSafeKeyword: string = keyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );
    const keywordMatcher = new RegExp(regexSafeKeyword, 'gi');
    return (text.match(keywordMatcher) || []).length;
}

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [CommonModule, ArticlesFilterComponent, ArticleCardComponent],
    templateUrl: './article-list.component.html',
    styleUrl: './article-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent implements OnInit {
    private readonly articleService = inject(ArticleService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    keywords = signal<string[]>([]);

    rankedArticles = computed(() => {
        const articles: GetArticleRequest[] = this.articles();

        const lowercasedKeywords: string[] = untracked(() =>
            this.keywords().map((k: string) => k.toLowerCase())
        );

        if (lowercasedKeywords.length === 0) return articles;

        const matchedKeywordsResults = articles.map(
            (article: GetArticleRequest) => {
                const title: string = article.title.toLowerCase();
                const summary: string = article.summary.toLowerCase();

                let titleMatchesCounter = 0;
                let summaryMatchesCounter = 0;

                for (const keyword of lowercasedKeywords) {
                    titleMatchesCounter += countMatchesInText(title, keyword);
                    summaryMatchesCounter += countMatchesInText(
                        summary,
                        keyword
                    );
                }
                return { article, titleMatchesCounter, summaryMatchesCounter };
            }
        );
        return matchedKeywordsResults
            .sort(
                (x, y) =>
                    y.titleMatchesCounter - x.titleMatchesCounter ||
                    y.summaryMatchesCounter - x.summaryMatchesCounter
            )
            .map((result) => result.article);
    });

    isLoading = signal(false);
    error = signal<string | null>(null);
    resultsCount = computed(() => this.rankedArticles().length);

    private articles = signal<GetArticleRequest[]>([]);

    private searchSubject = new Subject<string>();

    ngOnInit(): void {
        this.initSearchSubscription();
    }

    onSearch(searchValue: string) {
        this.searchSubject.next(searchValue);
    }

    onCardClick(articleId: number) {
        const article: GetArticleRequest | undefined = this.articles().find(
            (a) => a.id === articleId
        );
        this.router.navigate(['/articles', articleId], {
            state: article ? { article } : undefined,
        });
    }

    retryLoad() {
        this.searchSubject.next(this.keywords().join(' '));
    }

    private initSearchSubscription(): void {
        this.searchSubject
            .pipe(
                startWith(''),
                debounceTime(300),
                map((value: string) => splitKeywords(value)),
                distinctUntilChanged(
                    (a: string[], b: string[]) => a.join(' ') === b.join(' ')
                ),
                tap((keywords: string[]) => {
                    this.keywords.set(keywords);
                    this.isLoading.set(true);
                    this.error.set(null);
                }),
                switchMap((keywords: string[]) => {
                    const params = keywords.length
                        ? { search: keywords.join(',') }
                        : undefined;
                    return this.articleService.getArticles(params).pipe(
                        catchError(() => {
                            this.error.set(
                                'Could not load articles. Please try again later.'
                            );
                            return of({ results: [] });
                        }),
                        finalize(() => this.isLoading.set(false))
                    );
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((response) => {
                this.articles.set(response.results);
            });
    }
}
