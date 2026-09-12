export interface Notification {
  id: string;
  title: string;
  body: string;
  linkPath: string | null;
  read: boolean;
  createdAt: string;
}
