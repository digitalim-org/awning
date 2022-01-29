export default class Model {
  static pluralize(_Model: typeof Model) {
    const name = _Model.name.toLowerCase();

    // switch on last letter of word
    switch (name[name.length - 1]) {
      case "y":
        return name.slice(0, name.length - 1) + "ies";
      default:
        return name + "s";
    }
  }

  static columns: string[];

  constructor(fields?: Record<string, any>) {
    Object.assign(this, fields);
  }
}
