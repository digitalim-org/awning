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
