import {
    ChangeDetectionStrategy,
    Component,
    Signal,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    finalize,
    map,
    of,
    startWith,
    switchMap,
    tap,
} from 'rxjs';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { ArticleService } from '../../services/article.service';
import { GetArticleRequest } from '../../models/article.model';
import { RankByKeywordsPipe } from '../../../../shared/pipes/rank-by-keywords.pipe';

export function splitKeywords(
    searchInput: string | null | undefined
): string[] {
    return (searchInput ?? '')
        .split(/[\s,]+/)
        .map((keyword: string) => keyword.trim())
        .filter((keyword: string) => !!keyword);
}

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
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

    readonly searchControl = new FormControl<string>('', { nonNullable: true });

    readonly keywords = signal<string[]>([]);
    readonly isLoading = signal<boolean>(true);
    readonly error = signal<string | null>(null);

    readonly resultsCount = computed(() => this.articles().length);

    readonly articles: Signal<GetArticleRequest[]> = toSignal(
        this.searchControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            map((value: string) => splitKeywords(value)),
            distinctUntilChanged(
                (previousKeywords: string[], currentKeywords: string[]) =>
                    previousKeywords.join(' ') === currentKeywords.join(' ')
            ),
            tap((keywords: string[]) => {
                this.isLoading.set(true);
                this.error.set(null);
                this.keywords.set(keywords);
            }),
            switchMap((keywords: string[]) => {
                const searchParams = keywords.length
                    ? { search: keywords.join(',') }
                    : undefined;

                return this.articleService.getArticles(searchParams).pipe(
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

    onCardClick(articleId: number): void {
        this.router.navigate(['/articles', articleId]);
    }

    onRetryLoad(): void {
        const currentKeywords = this.keywords().join(' ');
        this.searchControl.setValue(currentKeywords);
    }
}
