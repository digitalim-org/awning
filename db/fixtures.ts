import Model from "./Model.ts";
import type { Getters } from "./Database.ts";
import { Associate } from "./Association.ts";

type UserModels = {
  item: Item;
  product: Product;
  category: Category;
};

declare module "./Database.ts" {
  interface Database extends Getters<UserModels> {}
}

export type ItemType = {
  name: string;
  price: number;
};

export interface Item extends ItemType {}
export class Item extends Model<ItemType> {
  static columns = ["name", "price"];
}

type ProductType = {
  color: string;
  qty: number;
  // categories?: Category[];
};

export interface Product extends ProductType {
  categories: Associate<Category>;
}
export class Product extends Model<ProductType & { categories?: Category[] }> {
  static columns = ["color", "qty"];
}

type CategoryType = {
  name: string;
  products?: () => Product[];
};

export interface Category extends CategoryType {
  products: Associate<Product>;
}
export class Category extends Model<CategoryType> {
  static columns = ["name"];
}
