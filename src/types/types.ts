export type TProductCategory = 'VEGETABLE' | 'FRUIT' | 'DAIRY' | 'OTHERS';
export type TUserRole = 'ADMIN' | 'USER' | 'OWNER';

export interface IItem {
  id: number;
  name: string;
  price: number;
  category: TProductCategory,
  count: number;
  is_deleted: boolean;
}

export interface IUser {
  id: number;
  role: TUserRole;
  email: string;
  last_login: string;
}