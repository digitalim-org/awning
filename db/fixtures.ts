import Model from "./Model.ts";

export class Item extends Model {
  static columns = ["name", "price"];
  declare public name: string;
  declare public price: number;
}

// type ValueOf<T> = T extends ReadonlyArray<any> ? T[number] : T[keyof T]

// type ProductType = Record<ValueOf<typeof Product.columns>, string | number>

type ProductType = {
  color: string;
  qty: number;
};

export interface Product extends ProductType {}

export class Product extends Model<ProductType> {
  static columns = ["color", "qty"];
  // declare public color: string;
  // declare public qty: number;
  // [field: keyof ProductType]: ProductType[keyof ProductType]

  // constructor(product: ProductType) {
  //   super(product)
  // }

  addToCategory(category: Category) {
  }
}

export class Category extends Model {
  static columns = ["name"];
  declare public name: string;
}
