import {
    Component,
    signal,
    inject,
    ChangeDetectionStrategy,
    computed,
    Signal,
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
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticlesFilterComponent } from './components/articles-filter/articles-filter.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { RankByKeywordsPipe } from '../../../../shared/pipes/rank-by-keywords.pipe';
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

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [
        CommonModule,
        ArticlesFilterComponent,
        ArticleCardComponent,
        RankByKeywordsPipe,
    ],
    templateUrl: './article-list.component.html',
    styleUrl: './article-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
    private readonly articleService = inject(ArticleService);
    private readonly router = inject(Router);

    keywords = signal<string[]>([]);

    isLoading = signal(true);
    error = signal<string | null>(null);
    resultsCount = computed(() => this.articles().length);

    private readonly searchSubject = new Subject<string>();

    articles: Signal<GetArticleRequest[]> = toSignal(
        this.searchSubject.pipe(
            startWith(''),
            debounceTime(300),
            map((value: string) => splitKeywords(value)),
            distinctUntilChanged(
                (a: string[], b: string[]) => a.join(' ') === b.join(' ')
            ),
            tap((keywords: string[]) => {
                this.isLoading.set(true);
                this.error.set(null);
                this.keywords.set(keywords);
            }),
            switchMap((keywords: string[]) => {
                const params = keywords.length
                    ? { search: keywords.join(',') }
                    : undefined;
                return this.articleService.getArticles(params).pipe(
                    map((response) => response.results),
                    catchError(() => {
                        this.error.set(
                            'Could not load articles. Please try again later.'
                        );
                        return of([] as GetArticleRequest[]);
                    }),
                    finalize(() => this.isLoading.set(false))
                );
            })
        ),
        { initialValue: [] }
    );

    onSearch(searchValue: string) {
        this.searchSubject.next(searchValue);
    }

    onCardClick(articleId: number) {
        this.router.navigate(['/articles', articleId]);
    }

    onRetryLoad() {
        this.searchSubject.next(this.keywords().join(' '));
    }
}
