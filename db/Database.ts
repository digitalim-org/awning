import { DB, QueryParameterSet, RowObject } from "./deps.ts";
import Model, { DerivedModel } from "./Model.ts";
import logger from "../logger/mod.ts";
import Association from "./Association.ts";
import { arrToCtorNameMap } from "./utils.ts";
// import type { UserModels } from "./fixtures.ts";

interface DatabaseOpts {
  filepath?: string;
  memory?: boolean;
}

// type CreateTableOpts = typeof Model | {
//   name: string;
//   columns: string[];
// };

type CreateTableOpts = DerivedModel | {
  name: string;
  columns: string[];
};

export type Getters<UserModels> = {
  [Property in keyof UserModels as `${string & Property}ById`]: (
    id: number,
  ) => UserModels[Property];
};

export class Database extends DB {
  constructor({ filepath, memory }: DatabaseOpts = {}) {
    super(memory ? undefined : filepath);
    // Bind all the methods so we can destructure them to use them.
    Object.entries({
      ...Object.getOwnPropertyDescriptors(Database.prototype),
      ...Object.getOwnPropertyDescriptors(DB.prototype),
    }).forEach(([name, { value }]) => {
      if (typeof value === "function" && value.name !== "constructor") {
        this[name as keyof this] = value.bind(this);
      }
    });
  }

  save(model: Model) {
    const modelCtor = Object.getPrototypeOf(model).constructor;
    const { columns } = modelCtor;

    const query = `INSERT INTO ${model.pluralize()} (${columns}) VALUES (${
      columns.map(() => "?")
    })`;

    const values = columns.map((column: string) => model[column]);

    logger.debug(`${query} with ${values}`);

    this.query(query, values as QueryParameterSet);

    model.id = this.lastInsertRowId;
    model.isSaved = true;

    this.setGetters(modelCtor);
  }

  setGetters(modelCtor: DerivedModel) {
    const modelName = modelCtor.name.toLowerCase();
    // If already set, return.
    if (this[`${modelName}ById` as keyof this] !== undefined) return;

    (this as Record<string, unknown>)[`${modelName}ById`] = (id: number) =>
      this.byId(id, modelCtor as DerivedModel<RowObject>);
  }

  createAssociations(
    // I can't get the type right for this so settling for now
    // on object[] with a runtime check.
    _models: object[],
    relationships: string[],
  ) {
    const models = _models as DerivedModel[];
    if (
      Object.values(models).some((model) =>
        Object.getPrototypeOf(model) !== Model
      )
    ) {
      throw new Error("Provided model does not extend from Model");
    }

    const modelsMap = arrToCtorNameMap(models);

    const relationshipMatcher = /([A-Z][a-z]+) ?([>\-<]{3}) ?([A-Z][a-z]+)/;

    relationships.forEach((r) => {
      const matches = r.match(relationshipMatcher);

      const [_, first, relationship, second] = matches!;

      if (!first || !relationship || !second) {
        throw new Error("relationship expression malformed.");
      }

      new Association(
        this,
        [modelsMap[first], modelsMap[second]],
        relationship,
      );
    });
  }

  byId(
    id: number,
    ctor: DerivedModel<RowObject>,
  ) {
    const query = `SELECT * FROM ${ctor.tableName()} WHERE OID = ?`;

    logger.debug(`${query} with ${id}`);

    const rows = this.queryEntries(query, [id]);

    if (rows.length === 0) return null;

    // There should only ever be one row since this is an id lookup.
    const row = rows[0];

    return new ctor({
      ...row,
      isSaved: true,
      id,
    });
  }

  createTable(modelOrOpts: CreateTableOpts) {
    let { name, columns } = modelOrOpts;
    if (Object.prototype.isPrototypeOf.call(Model, modelOrOpts)) {
      name = (modelOrOpts as typeof Model).pluralize();
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

    const query = `CREATE TABLE ${name} (${columns})`;

    logger.debug(query);

    this.query(query);
  }

  createTables(models: CreateTableOpts[]) {
    models.forEach((model) => {
      this.createTable(model);
    });
  }
}
