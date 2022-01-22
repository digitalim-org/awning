import logger from "../logger/mod.ts";

export const isClient = window.document !== undefined;
export const isServer = !isClient;

export const isDev = isServer
  ? Deno.env.get("AWNING_DEV")?.toLowerCase() === "true"
  : (window as any).AWNING_DEV === true;

logger.debug(`isClient: ${isClient}`);

export const server = (cb?: () => unknown): boolean => {
  if (isServer) {
    cb && cb();
  }
  return isServer;
};

export const client = (cb?: () => unknown): boolean => {
  if (isClient) {
    cb && cb();
  }
  return isClient;
};
