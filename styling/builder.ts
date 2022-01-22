import { Properties } from "https://esm.sh/csstype/index.d.ts";
import logger from "../logger/mod.ts";
import { client, server } from "../utils/is.ts";

interface Classname {
  [index: string]: string;
}

export const stylesheets: [number, string][] = [];

const normalizeCSSProp = (prop: string) =>
  prop.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

let marker = 0;
export const css = (obj: Record<string, Properties>): Classname =>
  Object.entries(obj).reduce((resultClassnames, [className, ruleSet]) => {
    const rules = Object.entries(ruleSet).reduce(
      (resultStr, [prop, val]) =>
        resultStr + `${normalizeCSSProp(prop)}: ${val};`,
      "",
    );

    const generatedClassName = `_${marker++}`;

    server(() => {
      stylesheets.push([marker, `.${generatedClassName}{${rules}}`]);
    });

    client(() => {
      const existingStyles: HTMLStyleElement | null = document.querySelector(
        `[data-styles-id="${marker}"]`,
      );
      if (existingStyles) {
        existingStyles.sheet!.deleteRule(0);
        existingStyles.sheet!.insertRule(`.${generatedClassName}{${rules}}`);
      } else {
        throw new Error("For some reason styles don't already exist.");
      }
    });

    return {
      ...resultClassnames,
      [className]: generatedClassName,
    };
  }, {});
