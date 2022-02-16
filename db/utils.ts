import Model, { DerivedModel } from "./Model.ts";

export const arrToCtorNameMap = (
  arr: DerivedModel[],
): Record<string, DerivedModel> => {
  return arr.reduce((obj, ctor) => ({
    ...obj,
    [ctor.name]: ctor,
  }), {});
};
