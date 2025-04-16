export type TaskStatus = 'pendiente' | 'en progreso' | 'completado';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: 'pendiente' | 'en progreso' | 'completado';
    due_date?: string;
    tags?: string;
    priority: 'baja' | 'media' | 'alta';
    archived: boolean;
    project_id: number;
}
