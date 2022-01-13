import logger from "../logger/mod.ts";
const store: Record<string | symbol, unknown> = {};

export default new Proxy(store, {
  get(target, prop) {
    logger.debug(target);
    logger.debug(`Store: get: ${String(prop)}`);
    return target[prop];
  },
  set(target, prop, value) {
    logger.debug(target);
    logger.debug(`Store: set: ${String(prop)}, ${value}`);
    target[prop] = value;
    return true;
  },
});
