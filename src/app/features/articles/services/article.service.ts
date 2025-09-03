import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { GetArticleRequest } from '../models/article.model';
import { PaginatedResponse } from '../../../shared/models/paginated-reponse.model';

export interface ArticleQueryParams {
    search?: string;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getArticles(
        params?: ArticleQueryParams
    ): Observable<PaginatedResponse<GetArticleRequest>> {
        let httpParams = new HttpParams();

        if (params?.search) {
            httpParams = httpParams.set('search', params.search);
        }

        return this.http.get<PaginatedResponse<GetArticleRequest>>(
            `${this.baseUrl}articles/`,
            { params: httpParams }
        );
    }

    getArticleById(id: number): Observable<GetArticleRequest> {
        return this.http.get<GetArticleRequest>(
            `${this.baseUrl}articles/${id}/`
        );
    }
}
