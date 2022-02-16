import { Database } from "./Database.ts";
import Model, { DerivedModel } from "./Model.ts";
import logger from "../logger/mod.ts";

export type Associate<T> = () => T[] & {
  create(obj: T): boolean;
};

type ModelType = Model<Record<string, unknown>>;

export default class Association {
  private models: DerivedModel[];
  private db: Database;
  private relationship: string;

  constructor(
    db: Database,
    models: DerivedModel[],
    relationship: string,
  ) {
    this.models = models;
    this.db = db;
    this.relationship = relationship;

    const [Model1, Model2] = models;

    switch (relationship) {
      case ">-<":
        {
          db.createTable({
            name: `${Model1.pluralize()}_${Model2.pluralize()}`,
            columns: [
              `${Model1.name.toLowerCase()}_id`,
              `${Model2.name.toLowerCase()}_id`,
            ],
          });
        }
        break;
      default:
        throw new Error("malformed relationship token");
    }

    this.setTraps();

    models.forEach((model) => {
      model.associations = [this];
    });
  }

  setTraps() {
    const [model1, model2] = this.models;
    model1.prototype[model2.pluralize()] = this.selectAssociatedModels.bind(
      this,
    );
  }

  selectAssociatedModels(obj: ModelType) {
    const [model1, model2] = this.models;
    const db = this.db;

    if (!obj.isSaved) {
      throw new Error(
        `${
          Object.getPrototypeOf(this).constructor.name
        } is not saved. Can't retrieve associations`,
      );
    }

    const select = () => {
      const models1 = model1.pluralize();
      const models2 = model2.pluralize();
      const junctionTable = `${models1}_${models2}`;
      const model1Col = `${model1.name.toLowerCase()}_id`;
      const model2Col = `${model2.name.toLowerCase()}_id`;

      const query = `
        SELECT 
          ${models2}.* 
        FROM 
          ${models1}, ${models2}, ${junctionTable} 
        WHERE 
          ${models1}.OID = ${junctionTable}.${model1Col}
        AND
          ${models2}.OID = ${junctionTable}.${model2Col}
        `;

      logger.debug(query);

      return db.query(query);
    };

    return select;
  }
}
