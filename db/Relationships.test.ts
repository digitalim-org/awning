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
import { Category, Product } from "./fixtures.ts";

let db: Database;
beforeEach(() => {
  db = new Database();
});

afterEach(() => {
  db.close();
});

describe("Has many association", () => {
  focus("Gets associations", () => {
    db.createJunctionTables(
      { Product, Category },
      ["Product >-< Category"],
    );

    Product.bindDatabase(db);
    Category.bindDatabase(db);

    const product = new Product();
  });
});
