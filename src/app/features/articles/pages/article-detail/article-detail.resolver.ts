import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { GetArticleRequest } from '../../models/article.model';
import { EMPTY, catchError, of } from 'rxjs';

export const articleDetailResolver: ResolveFn<GetArticleRequest> = (
    route: ActivatedRouteSnapshot
) => {
    const articleService = inject(ArticleService);
    const router = inject(Router);

    const articleFromState = router.getCurrentNavigation()?.extras?.state?.[
        'article'
    ] as GetArticleRequest;

    if (articleFromState) {
        return of(articleFromState);
    }

    const idParam: string = route.paramMap.get('id') || '0';
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
        router.navigate(['/articles']);
        return EMPTY;
    }

    return articleService.getArticleById(id).pipe(
        catchError(() => {
            router.navigate(['/articles']);
            return EMPTY;
        })
    );
};
