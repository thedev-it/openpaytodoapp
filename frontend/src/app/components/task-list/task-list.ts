import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  PRIORITY_OPTIONS,
  Priority,
  STATUS_OPTIONS,
  Status,
  Task,
  TaskFilters,
} from '../../models/task.model';
import { TaskApi } from '../../services/task-api';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  private readonly api = inject(TaskApi);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly filters = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    status: new FormControl<Status | ''>('', { nonNullable: true }),
    priority: new FormControl<Priority | ''>('', { nonNullable: true }),
  });

  constructor() {
    const filters$ = this.filters.valueChanges.pipe(startWith(null), debounceTime(300));

    combineLatest([filters$, this.reload$])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap(() =>
          this.api.list(this.filters.getRawValue() as TaskFilters).pipe(
            catchError((error: HttpErrorResponse) => {
              this.errorMessage.set(this.toMessage(error));
              return of([] as Task[]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      });
  }

  reload(): void {
    this.reload$.next();
  }

  resetFilters(): void {
    this.filters.reset();
  }

  statusLabel(status: Status): string {
    return this.statusOptions.find((option) => option.value === status)?.label ?? status;
  }

  priorityLabel(priority: Priority): string {
    return this.priorityOptions.find((option) => option.value === priority)?.label ?? priority;
  }

  private toMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez que le backend est démarré (http://localhost:8080).';
    }
    return error.error?.message ?? 'Une erreur inattendue est survenue.';
  }
}