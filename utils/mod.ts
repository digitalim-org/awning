export const trimLeadingSlash = (str: string) => {
  if (str[0] === "/") {
    return str.slice(1);
  }

  return str;
};

export const trimTrailingSlash = (str: string) => {
  const len = str.length;
  if (str[len - 1] === "/") {
    return str.slice(0, len - 1);
  }

  return str;
};

export const getDirname = (filepath: string) =>
  trimTrailingSlash(new URL(".", filepath).pathname);

export const titleCase = (str: string) =>
  str[0].toUpperCase() + str.slice(1).toLowerCase();

const decoder = new TextDecoder("utf-8");
export const readFileSync = (filepath: string) =>
  decoder.decode(Deno.readFileSync(filepath));
