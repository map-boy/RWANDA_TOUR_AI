export type Role = 'user' | 'model';

export interface Message {
  id?: number;
  role: Role;
  text: string;
  imageUrl?: string;
  isLoadingImage?: boolean;
}
