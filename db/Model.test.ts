import { describe, it } from "../test-helpers/mod.ts";
import Model from "./Model.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.123.0/testing/asserts.ts";

class Product extends Model {}
class Category extends Model {}

describe("Model", () => {
  it("Pluralizes nouns which end in t", () => {
    assertEquals(Model.pluralize(Product), "products");
  });

  it("Pluralizes nouns which end in y", () => {
    assertEquals(Model.pluralize(Category), "categories");
  });
});
