import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlight',
    standalone: true,
})
export class HighlightPipe implements PipeTransform {
    transform(
        value: string | null | undefined,
        terms: string[] | null | undefined
    ): string {
        const text = value ?? '';
        const keywords = (terms ?? []).filter((t) => !!t);
        if (text.length === 0 || keywords.length === 0) return text;

        const escaped: string[] = keywords
            .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .filter((k) => k.length > 0);
        if (escaped.length === 0) return text;

        const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
        return text.replace(pattern, '<mark>$1</mark>');
    }
}
