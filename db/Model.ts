import { QueryParameterSet } from "./deps.ts";
import logger from "../logger/mod.ts";
import Database from "./Database.ts";

export type ModelType = {
  id: number;
};

export default abstract class Model<T extends Record<string, unknown>> {
  [field: string]: unknown
  declare public id: number;

  declare public static db: Database;
  declare public static columns: string[];

  static bindDatabase(db: Database) {
    Object.assign(this, { db });
    db.createTable(this);
  }

  static pluralize() {
    const name = this.name.toLowerCase();

    // switch on last letter of word
    switch (name[name.length - 1]) {
      case "y":
        return name.slice(0, name.length - 1) + "ies";
      default:
        return name + "s";
    }
  }

  static by_id(id: number) {
    const query = `SELECT * FROM ${this.pluralize()} WHERE OID = ?`;

    logger.debug(`${query} with ${id}`);

    const rows = this.db.query<typeof this.columns>(query, [id]);

    if (rows.length === 0) return null;

    // There should only ever be one row since this is an id lookup.
    return rows[0].reduce((obj, val, index) => ({
      ...obj,
      [this.columns[index]]: val,
    }), {});
  }

  constructor(fields: T) {
    Object.assign(this, fields);
    this as T;
  }

  pluralize() {
    return (this.constructor as typeof Model).pluralize();
  }

  save() {
    const { columns } = this.constructor as typeof Model;

    const query = `INSERT INTO ${this.pluralize()} (${
      columns.join(", ")
    }) VALUES (${columns.map(() => "?")})`;

    logger.debug(`columns: ${columns}`);

    const values = columns.map((column) => this[column]);

    logger.debug(`${query} with ${values}`);

    const { db } = this.constructor as typeof Model;

    db.query(query, values as QueryParameterSet);

    this.id = db.lastInsertRowId;
  }

  toJSON() {
    const { columns } = this.constructor as typeof Model;
    return columns.reduce((obj, columnName) => ({
      ...obj,
      [columnName]: this[columnName],
    }), {});
  }
}
