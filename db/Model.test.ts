import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.123.0/testing/asserts.ts";
import Model from "./Model.ts";
import { Database } from "./Database.ts";
import { Item, ItemType } from "./fixtures.ts";

class Product extends Model {}
class Category extends Model {}

Deno.test("Model.pluralize", async (t) => {
  await t.step("Pluralizes nouns which end in t", () => {
    assertEquals(
      Product.pluralize(),
      "products",
    );
  });
  await t.step("Pluralizes nouns which end in y", () => {
    assertEquals(
      Category.pluralize(),
      "categories",
    );
  });
});

Deno.test("ORM", async (t) => {
  const db = new Database();
  const { queryEntries, createTable, save } = db;

  // await t.step("Allows access to the fields instantiated on a model", () => {
  //   const item = new Item({
  //     name: "foo",
  //     price: 123,
  //   });

  //   assertEquals(item.name, "foo");
  //   assertEquals(item.price, 123);
  // });

  await t.step("Saves the object", () => {
    createTable(Item);

    const itemData = {
      name: "foo",
      price: 123,
    };

    const item = new Item(itemData);

    save(item);

    const items = queryEntries<ItemType>("SELECT * FROM items");

    assertEquals(item.isSaved, true);
    assertEquals(items[0], itemData);
  });

  await t.step("Retrieval methods", async (t) => {
    await t.step("byId", () => {
      const { itemById } = db;

      const item = new Item({
        name: "foo",
        price: 123,
      });

      save(item);

      assertEquals(item.id, db.lastInsertRowId);

      const retrievedItem = itemById(db.lastInsertRowId);

      assertEquals(retrievedItem, item);
    });
  });

  db.close();
});
