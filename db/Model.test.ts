import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.123.0/testing/asserts.ts";
import {
  afterEach,
  beforeEach,
  describe,
  focus,
  it,
} from "../test-helpers/mod.ts";
import Model from "./Model.ts";
import Database from "./Database.ts";
import { Item } from "./fixtures.ts";

class Product extends Model {}
class Category extends Model {}

let db: Database;
beforeEach(() => {
  db = new Database();
});

afterEach(() => {
  db.close();
});

describe("Static methods", () => {
  it("Pluralizes nouns which end in t", () => {
    assertEquals(Product.pluralize(), "products");
  });

  it("Pluralizes nouns which end in y", () => {
    assertEquals(Category.pluralize(), "categories");
  });
});

describe("ORM", () => {
  it("Saves the object on instantiation", () => {
    const { query } = db;

    Item.bindDatabase(db);

    const item = new Item({
      name: "foo",
      price: 123,
    });

    item.save();

    const items = query<[string, number][]>("SELECT * FROM items");

    assertEquals(items[0], [item.name, item.price]);
  });

  it("Allows access to the fields instantiated on a model", () => {
    const item = new Item({
      name: "foo",
      price: 123,
    });

    assertEquals(item.name, "foo");
    assertEquals(item.price, 123);
  });
});

describe("Retrieval methods", () => {
  it("by_id", () => {
    Item.bindDatabase(db);

    const item = new Item({
      name: "foo",
      price: 123,
    });

    item.save();

    assertEquals(item.id, db.lastInsertRowId);

    const itemById = Item.by_id(item.id);

    assertEquals(JSON.stringify(itemById), JSON.stringify(item));
  });
});
