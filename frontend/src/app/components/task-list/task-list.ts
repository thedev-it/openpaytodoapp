import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  PageResponse,
  PRIORITY_OPTIONS,
  Priority,
  SortBy,
  SortDir,
  STATUS_OPTIONS,
  Status,
  Task,
  TaskFilters,
  getPriorityLabel,
  getStatusLabel,
} from '../../models/task.model';
import { ListParams, TaskApi } from '../../services/task-api';
import { ConfirmDialog, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';
import { TaskDetailDialog } from '../task-detail-dialog/task-detail-dialog';
import { TaskFormDialog } from '../task-form-dialog/task-form-dialog';

export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'title',     label: 'Titre' },
  { value: 'priority',  label: 'Priorité' },
  { value: 'status',    label: 'Statut' },
];

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  private readonly api = inject(TaskApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;
  readonly statusLabel = getStatusLabel;
  readonly priorityLabel = getPriorityLabel;

  readonly tasks = signal<Task[]>([]);
  readonly page = signal<PageResponse<Task> | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  // Pagination state
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly sortBy = signal<SortBy>('createdAt');
  readonly sortDir = signal<SortDir>('desc');

  readonly filters = new FormGroup({
    search:   new FormControl('', { nonNullable: true }),
    status:   new FormControl<Status | ''>('', { nonNullable: true }),
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
        switchMap(() => {
          const raw = this.filters.getRawValue() as TaskFilters;
          const params: ListParams = {
            ...raw,
            page:    this.currentPage(),
            size:    this.pageSize(),
            sortBy:  this.sortBy(),
            sortDir: this.sortDir(),
          };
          return this.api.list(params).pipe(
            catchError((error: HttpErrorResponse) => {
              this.errorMessage.set(this.toMessage(error));
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.page.set(response);
        this.tasks.set(response?.content ?? []);
        this.loading.set(false);
      });
  }

  // ── Pagination ──────────────────────────────────────────────
  goTo(p: number): void {
    this.currentPage.set(p);
    this.reload$.next();
  }

  prevPage(): void {
    if (this.currentPage() > 0) this.goTo(this.currentPage() - 1);
  }

  nextPage(): void {
    const p = this.page();
    if (p && !p.last) this.goTo(this.currentPage() + 1);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.reload$.next();
  }

  setSortBy(by: SortBy): void {
    if (this.sortBy() === by) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(by);
      this.sortDir.set('desc');
    }
    this.currentPage.set(0);
    this.reload$.next();
  }

  sortIcon(by: SortBy): string {
    if (this.sortBy() !== by) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  pages(): number[] {
    const total = this.page()?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  // ── Actions ──────────────────────────────────────────────────
  reload(): void {
    this.reload$.next();
  }

  resetFilters(): void {
    this.filters.reset();
    this.currentPage.set(0);
    this.sortBy.set('createdAt');
    this.sortDir.set('desc');
  }

  openCreate(): void { this.openForm(null); }
  openEdit(task: Task): void { this.openForm(task); }

  openDetail(task: Task): void {
    this.dialog
      .open<TaskDetailDialog, number, 'edit'>(TaskDetailDialog, {
        data: task.id,
        width: '520px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'edit') this.openEdit(task);
      });
  }

  openDelete(task: Task): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: 'Supprimer la tâche',
          message: `Voulez-vous vraiment supprimer « ${task.title} » ? Cette action est définitive.`,
          confirmLabel: 'Supprimer',
        },
        width: '440px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.api.delete(task.id).subscribe({
          next: () => {
            this.snackBar.open('Tâche supprimée', 'OK', { duration: 3000 });
            this.reload();
          },
          error: (error: HttpErrorResponse) => {
            this.notifyError(error);
            this.reload();
          },
        });
      });
  }

  changeStatus(task: Task, status: Status): void {
    if (task.status === status) return;
    this.api.updateStatus(task.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Statut : ${getStatusLabel(status)}`, 'OK', { duration: 3000 });
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.notifyError(error),
    });
  }

  private openForm(task: Task | null): void {
    this.dialog
      .open<TaskFormDialog, Task | null, Task>(TaskFormDialog, {
        data: task,
        width: '520px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.snackBar.open(task ? 'Tâche modifiée' : 'Tâche créée', 'OK', { duration: 3000 });
          this.reload();
        }
      });
  }

  private notifyError(error: HttpErrorResponse): void {
    this.snackBar.open(this.toMessage(error), 'OK', { duration: 5000 });
  }

  private toMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez que le backend est démarré (http://localhost:8080).';
    }
    return error.error?.message ?? 'Une erreur inattendue est survenue.';
  }
}