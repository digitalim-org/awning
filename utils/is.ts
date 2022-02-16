export const isClient = "document" in window;
export const isServer = !isClient;

export const isDev = isServer
  ? (await Deno.permissions.query({ name: "env" })).state === "granted" &&
    Deno.env.get("AWNING_DEV")?.toLowerCase() === "true"
  : (window as any).AWNING_DEV === true;

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
