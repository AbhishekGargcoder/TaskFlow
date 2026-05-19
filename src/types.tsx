export interface Todo {
    id: string;
    title: string;
    description: string;
    done: boolean;
    userId: string;
    createdAt?: string;
    updatedAt: string;
    user?: {
        name: string | null;
    };
}