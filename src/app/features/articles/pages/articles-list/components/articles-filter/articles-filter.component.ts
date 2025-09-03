import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    output, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-articles-filter',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: './articles-filter.component.html',
    styleUrl: './articles-filter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesFilterComponent implements OnInit {
    readonly searchChange = output<string>();

    readonly searchControl = new FormControl('');

    private readonly destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.setupSearchSubscription();
    }

    private setupSearchSubscription() {
        this.searchControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.searchChange.emit(value || '');
            });
    }
}
