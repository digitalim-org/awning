import { DB } from "./deps.ts";
import Model from "./Model.ts";
import logger from "../logger/mod.ts";

interface DatabaseOpts {
  filepath?: string;
  memory?: boolean;
}

type CreateTableOpts = typeof Model | {
  name: string;
  columns: string[];
};

export default class Database extends DB {
  static methods = [
    "createTable",
    "createTables",
    "createJunctionTables",
    "query",
    "close",
  ] as const;

  constructor({ filepath, memory }: DatabaseOpts = {}) {
    super(memory ? undefined : filepath);
    // Bind all the methods so we can destructure them to use them if we want.
    Database.methods.forEach(
      (method: typeof Database.methods[number]) => {
        Object.assign(this, {
          [method]: this[method].bind(this),
        });
      },
    );
  }

  createTable(modelOrOpts: CreateTableOpts) {
    let { name, columns } = modelOrOpts;
    if (Object.prototype.isPrototypeOf.call(Model, modelOrOpts)) {
      name = Model.pluralize(modelOrOpts as typeof Model);
    }

    const sanitizer = /[A-Za-z]+/;
    if (!sanitizer.test(name)) {
      throw new Error(`${name} is not a valid table name.`);
    }

    if (!columns.every(sanitizer.test.bind(sanitizer))) {
      throw new Error(`Columns contain an invalid column name.`);
    }

    if (!columns?.length) {
      throw new ReferenceError(`Table ${name} has no columns?`);
    }

    const query = `CREATE TABLE ${name} (${columns.join(", ")})`;

    logger.debug(query);

    this.query(query);
  }

  createTables(models: typeof Model[]) {
    models.forEach((model) => {
      this.createTable(model);
    });
  }

  createJunctionTables(
    models: Record<string, typeof Model>,
    relationships: string[],
  ) {
    relationships.forEach((r) => {
      const matches = r.match(/([A-Z][a-z]+) ?([>\-<]{3}) ?([A-Z][a-z]+)/);

      const [_, first, relationship, second] = matches!;

      if (!first || !relationship || !second) {
        throw new Error("relationship expression malformed.");
      }

      switch (relationship) {
        case ">-<":
          {
            const firstModel = models[first];
            const secondModel = models[second];

            this.createTable({
              name: `${Model.pluralize(firstModel)}_${
                Model.pluralize(secondModel)
              }`,
              columns: [
                `${first.toLowerCase()}_id`,
                `${second.toLowerCase()}_id`,
              ],
            });
          }
          break;
        default:
          throw new Error("malformed relationship token");
      }
    });
  }
}
