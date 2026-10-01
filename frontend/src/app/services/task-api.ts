import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Status, Task, TaskFilters, TaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(filters: TaskFilters = {}): Observable<Task[]> {
    let params = new HttpParams();
    const search = filters.search?.trim();
    if (search) {
      params = params.set('search', search);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }
    return this.http.get<Task[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(task: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  update(id: number, task: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  updateStatus(id: number, status: Status): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}