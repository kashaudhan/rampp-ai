export type TProductCategory = 'VEGETABLE' | 'FRUIT' | 'DAIRY' | 'OTHERS';
export type TUserRole = 'ADMIN' | 'CUSTOMER' | 'OWNER';

export enum UserType {
  ADMIN = 'ADMIN',
  CUSTOMER = 'USER',
  OWNER = 'OWNER'
}

export interface IProduct {
  id: number;
  name: string;
  price: number;
  category: TProductCategory,
  count: number;
  quantity: number;
  is_deleted: boolean;
  tenant_id: number;
}

export interface IUser {
  id: number;
  name: string;
  user_type: TUserRole;
  email: string;
  tenant_id: number;
};

export interface IAddress {
  id: number;
  user_id: number;
  address: string;
}

export interface ICart {
  id: number;
  product_id: number;
  user_id: number;
  quantity: number;
}

export interface IOrder {
  id: number;
  order_amount: number;
  address: string;
  products?: IProduct[]
}