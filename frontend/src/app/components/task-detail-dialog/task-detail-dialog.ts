import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Task, getPriorityLabel, getStatusLabel } from '../../models/task.model';
import { TaskApi } from '../../services/task-api';

@Component({
  selector: 'app-task-detail-dialog',
  imports: [DatePipe, MatButtonModule, MatDialogModule, MatProgressBarModule],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog {
  private readonly api = inject(TaskApi);
  private readonly dialogRef = inject<MatDialogRef<TaskDetailDialog, 'edit'>>(MatDialogRef);
  private readonly id = inject<number>(MAT_DIALOG_DATA);

  readonly task = signal<Task | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly statusLabel = getStatusLabel;
  readonly priorityLabel = getPriorityLabel;

  constructor() {
    this.api.get(this.id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.toMessage(error));
      },
    });
  }

  edit(): void {
    this.dialogRef.close('edit');
  }

  private toMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez que le backend est démarré.';
    }
    if (error.status === 404) {
      return "Cette tâche n'existe plus.";
    }
    return error.error?.message ?? 'Une erreur inattendue est survenue.';
  }
}