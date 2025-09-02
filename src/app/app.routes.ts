import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/news', pathMatch: 'full' },
    //   {
    //     path: 'news',
    //     loadComponent: () => import('./pages/news-list/news-list.component').then(m => m.NewsListComponent)
    //   },
    //   {
    //     path: 'news/:id',
    //     loadComponent: () => import('./pages/news-detail/news-detail.component').then(m => m.NewsDetailComponent)
    //   },
    { path: '**', redirectTo: '/news' },
];
