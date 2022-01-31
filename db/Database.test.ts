import {
  afterEach,
  beforeEach,
  describe,
  focus,
  it,
} from "../test-helpers/mod.ts";
import Database from "./Database.ts";
import Model from "./Model.ts";
import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";

let db: Database;
beforeEach(() => {
  db = new Database();
});

afterEach(() => {
  db.close();
});

describe("Database", () => {
  it("Creates a table", () => {
    const { query, createTable } = db;

    class Foo extends Model {}
    Foo.columns = ["bar", "baz"];

    createTable(Foo);
    const foosTable = query<string[]>(
      "SELECT name FROM sqlite_schema WHERE type='table'",
    );

    assertEquals(foosTable[0][0], "foos");
  });
});

describe("Relationships", () => {
  it("Creates a junction table for many-to-many relationships", () => {
    const { query, createJunctionTables } = db;
    class Foo extends Model {}
    class Bar extends Model {}
    const relationships = ["Foo >-< Bar"];
    createJunctionTables({ Foo, Bar }, relationships);

    const junctionTable = query<string[]>(
      "SELECT name FROM sqlite_schema WHERE type='table'",
    );

    assertEquals(junctionTable[0][0], "foos_bars");
  });
});
