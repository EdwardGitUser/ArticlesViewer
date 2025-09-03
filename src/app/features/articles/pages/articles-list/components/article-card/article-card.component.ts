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

export function getSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${day}${getSuffix(day)}, ${year}`;
}

@Component({
    selector: 'app-article-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        HighlightPipe,
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

    formatDate = formatDate;
}
