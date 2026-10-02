import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ApiError,
  PRIORITY_OPTIONS,
  Priority,
  STATUS_OPTIONS,
  Status,
  Task,
  TaskRequest,
} from '../../models/task.model';
import { TaskApi } from '../../services/task-api';

function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  return value && value.trim().length === 0 ? { blank: true } : null;
}

@Component({
  selector: 'app-task-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
})
export class TaskFormDialog {
  private readonly api = inject(TaskApi);
  private readonly dialogRef = inject<MatDialogRef<TaskFormDialog, Task>>(MatDialogRef);
  private readonly task = inject<Task | null>(MAT_DIALOG_DATA);

  readonly isEdit = this.task !== null;
  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup({
    title: new FormControl(this.task?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(150)],
    }),
    description: new FormControl(this.task?.description ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
    status: new FormControl<Status>(this.task?.status ?? 'TODO', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: new FormControl<Priority>(this.task?.priority ?? 'MEDIUM', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: TaskRequest = {
      title: raw.title.trim(),
      description: raw.description.trim() || null,
      status: raw.status,
      priority: raw.priority,
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    const call$ = this.task
      ? this.api.update(this.task.id, request)
      : this.api.create(request);

    call$.subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.handleError(error);
      },
    });
  }

  errorOf(name: 'title' | 'description'): string {
    const errors = this.form.controls[name].errors ?? {};
    if (errors['required'] || errors['blank']) {
      return 'Le titre est obligatoire';
    }
    if (errors['maxlength']) {
      return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    }
    if (errors['server']) {
      return errors['server'];
    }
    return '';
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.errorMessage.set('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
      return;
    }

    const apiError = error.error as ApiError | null;
    let handled = false;

    for (const [field, message] of Object.entries(apiError?.fieldErrors ?? {})) {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ server: message });
        control.markAsTouched();
        handled = true;
      }
    }

    if (!handled) {
      this.errorMessage.set(apiError?.message ?? 'Une erreur inattendue est survenue.');
    }
  }
}