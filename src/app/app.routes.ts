import { Routes } from '@angular/router';
import { ArticleListComponent } from './features/articles/pages/articles-list/article-list.component';
import { articleDetailResolver } from './features/articles/pages/article-detail/article-detail.resolver';

export const routes: Routes = [
    { path: '', redirectTo: '/articles', pathMatch: 'full' },
    {
        path: 'articles',
        component: ArticleListComponent,
    },
    {
        path: 'articles/:id',
        loadComponent: () =>
            import(
                './features/articles/pages/article-detail/article-detail.component'
            ).then((m) => m.ArticleDetailComponent),
        resolve: { article: articleDetailResolver },
    },
    { path: '**', redirectTo: '/articles' },
];
