import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.123.0/testing/asserts.ts";
import Model from "./Model.ts";
import { Database } from "./Database.ts";
import Association from "./Association.ts";
import { Category, Product } from "./fixtures.ts";

Deno.test("Has many relationship", async (t) => {
  const db = new Database();
  const { save, createTables, createAssociations } = db;

  await t.step("Creates associated objects", () => {
    createAssociations(
      [Product, Category],
      ["Product >-< Category"],
    );

    const category1 = new Category({
      name: "cat1",
    });

    const product = new Product({
      qty: 2,
      color: "red",
      categories: [category1],
    });

    createTables([Category, Product]);
    save(product);

    // product.categories(desc, uppercase)

    console.log(Object.getPrototypeOf(product));
    console.log("product.categories()", product.categories());
    console.log("product.categories", product.categories);

    console.log("assoc.", Product.associations);

    assertEquals(product.categories(), [category1]);
  });

  db.close();
});
