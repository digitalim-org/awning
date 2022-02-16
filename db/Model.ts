import { QueryParameterSet } from "./deps.ts";
import logger from "../logger/mod.ts";
import { Database } from "./Database.ts";
import Association from "./Association.ts";

type ModelCtor = Omit<typeof Model, "new">;

export interface DerivedModel<T = Record<string, unknown>> extends ModelCtor {
  new (fields: T): Model;
}

// T is the interface for "fields"
export default abstract class Model<T = Record<string, unknown>> {
  [field: string]: unknown
  public isSaved = false;
  declare public id: number;

  declare public static columns: string[];
  declare public static associations: Association[];

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

  static tableName() {
    return this.pluralize();
  }

  constructor(fields: T & { isSaved?: boolean }) {
    const proxy = new Proxy(Object.assign(this, fields), {
      set(target, prop, val) {
        target[prop as keyof T] = val;
        return true;
      },
      get: (target, prop, receiver) => {
        // const val = target[prop as string];
        // console.log("target", target);
        // console.log("prop", prop);
        // console.log("foo?", typeof target[prop as string]);
        // console.log(typeof val === "function" && val.name);
        if (
          target.isSaved &&
          target.constructor.prototype[prop]
        ) {
          console.log("receiver", receiver);

          return (target.constructor.prototype[prop])(
            receiver,
          );
        }
        return target[prop as string];
      },
    });

    // this.save();
    // this.setAssociations;

    // this.id = db.lastInsertRowId;

    // this.isSaved = true;
    // return proxy;
    Object.assign(this, proxy);
  }

  tableName() {
    return this.pluralize();
  }

  pluralize() {
    return (this.constructor as typeof Model).pluralize();
  }

  toJSON() {
    const { columns } = this.constructor as typeof Model;
    return columns.reduce((obj, columnName) => ({
      ...obj,
      [columnName]: this[columnName],
    }), {});
  }
}
