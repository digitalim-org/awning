import { Database, faker, Relationships } from "./deps.ts";
import Product from "./models/product.ts";
import Category from "./models/category.ts";

export default async (db: Database) => {
  const ProductCategory = Relationships.manyToMany(Product, Category);

  await db
    .link([ProductCategory, Product, Category])
    .sync({ drop: true });

  for (let i = 0; i < 5; i++) {
    const category = await Category.create({
      name: faker.commerce.department(),
    });
    await category.save();
    console.log("category", category);

    // ProductCategory.create({
    //   categoryId: category.id,
    // });

    // Product.create({
    //   name: faker.commerce.productName(),
    //   price: faker.commerce.price(),
    //   stock: 3,
    //   category: faker.commerce.department(),
    //   ingredients: faker.commerce.productMaterial(),
    //   description: faker.commerce.product(),
    //   images: JSON.stringify([
    //     "https://picsum.photos/200",
    //     "https://picsum.photos/200",
    //   ]),
    // });
  }
};
