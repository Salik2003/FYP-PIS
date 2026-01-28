export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    status: 'ACTIVE' | 'INACTIVE';
    lastLogin: string;
}

export const mockUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@toolbox.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2024-03-10T10:00:00Z' },
    { id: 2, name: 'John Doe', email: 'john@toolbox.com', role: 'USER', status: 'ACTIVE', lastLogin: '2024-03-09T14:30:00Z' },
    { id: 3, name: 'Jane Smith', email: 'jane@toolbox.com', role: 'USER', status: 'INACTIVE', lastLogin: '2024-02-28T09:15:00Z' },
];
