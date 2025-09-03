import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GetArticleRequest } from '../../models/article.model';

@Component({
    selector: 'app-article-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './article-detail.component.html',
    styleUrl: './article-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailComponent {
    private readonly route = inject(ActivatedRoute);
    readonly article = this.route.snapshot.data['article'] as GetArticleRequest;

    readonly imageError = signal(false);

    onImageError(): void {
        this.imageError.set(true);
    }
}
