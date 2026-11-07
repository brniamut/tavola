/** A user account, as an admin screen lists it. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  team: string | null;
  country: string;
  logins: number;
  storageMb: number;
  createdAt: string;
  lastSeenAt: string | null;
  mfa: boolean;
}
