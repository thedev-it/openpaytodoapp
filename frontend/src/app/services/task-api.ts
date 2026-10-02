import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse, SortBy, SortDir, Status, Task, TaskFilters, TaskRequest } from '../models/task.model';

export interface ListParams extends TaskFilters {
  page?: number;
  size?: number;
  sortBy?: SortBy;
  sortDir?: SortDir;
}

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(params: ListParams = {}): Observable<PageResponse<Task>> {
    let httpParams = new HttpParams();
    const search = params.search?.trim();
    if (search) httpParams = httpParams.set('search', search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    httpParams = httpParams.set('page', params.page ?? 0);
    httpParams = httpParams.set('size', params.size ?? 10);
    httpParams = httpParams.set('sortBy', params.sortBy ?? 'createdAt');
    httpParams = httpParams.set('sortDir', params.sortDir ?? 'desc');
    return this.http.get<PageResponse<Task>>(this.baseUrl, { params: httpParams });
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