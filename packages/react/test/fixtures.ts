import { defineColumns } from '../src/index.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  logins: number;
  createdAt: string;
  active: boolean;
  team: string | null;
}

export const users: User[] = [
  {
    id: 'u1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'admin',
    logins: 42,
    createdAt: '2026-01-15',
    active: true,
    team: 'Core',
  },
  {
    id: 'u2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    role: 'editor',
    logins: 7,
    createdAt: '2026-03-02',
    active: true,
    team: null,
  },
  {
    id: 'u3',
    name: 'Alan Turing',
    email: 'alan@example.com',
    role: 'viewer',
    logins: 0,
    createdAt: '2025-11-20',
    active: false,
    team: 'Research',
  },
  {
    id: 'u4',
    name: 'Edsger Dijkstra',
    email: 'edsger@example.com',
    role: 'editor',
    logins: 19,
    createdAt: '2026-05-30',
    active: true,
    team: 'Core',
  },
];

export const columns = defineColumns<User>((col) => [
  col.text('name', { pin: 'start' }),
  col.text('email'),
  col.enum('role', { options: ['admin', 'editor', 'viewer'] }),
  col.number('logins'),
  col.date('createdAt', { header: 'Created' }),
  col.boolean('active'),
  col.text('team'),
]);
