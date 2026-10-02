export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type SortDir = 'asc' | 'desc';
export type SortBy = 'createdAt' | 'title' | 'priority' | 'status';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  createdAt: string;
}

export interface TaskRequest {
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
}

export interface TaskFilters {
  search?: string;
  status?: Status | '';
  priority?: Priority | '';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  sortBy: SortBy;
  sortDir: SortDir;
}

export interface ApiError {
  status: number;
  message: string;
  fieldErrors: Record<string, string>;
  timestamp: string;
}

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'TODO', label: 'À faire' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE', label: 'Terminée' },
];

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Basse' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
];

export function getStatusLabel(status: Status): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority;
}
