/** A person in the docs examples. */
export interface Person {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  team: string;
  logins: number;
  joined: string;
  active: boolean;
}
