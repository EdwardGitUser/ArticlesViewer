import {
    Component,
    ChangeDetectionStrategy,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GetArticleRequest } from '../../../../models/article.model';
import { HighlightPipe } from '../../../../../../shared/pipes/highlight.pipe';
import { FormatDatePipe } from '../../../../../../shared/pipes/format-date.pipe';

@Component({
    selector: 'app-article-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        HighlightPipe,
        FormatDatePipe,
    ],
    templateUrl: './article-card.component.html',
    styleUrl: './article-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
    readonly article = input.required<GetArticleRequest>();
    readonly cardClick = output<number>();
    readonly highlightKeywords = input<string[]>();

    readonly imageError = signal(false);

    onImageError(): void {
        this.imageError.set(true);
    }

    onCardClick(): void {
        this.cardClick.emit(this.article().id);
    }
}
