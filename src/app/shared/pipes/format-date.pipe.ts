import { Pipe, PipeTransform } from '@angular/core';

function getSuffix(day: number): string {
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

@Pipe({
    name: 'formatDate',
    standalone: true,
})
export class FormatDatePipe implements PipeTransform {
    transform(dateString: string | null | undefined): string {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return '';
        }

        const day: number = date.getDate();
        const month: string = date.toLocaleString('en-US', { month: 'short' });
        const year: number = date.getFullYear();

        return `${month} ${day}${getSuffix(day)}, ${year}`;
    }
}
