export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

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
