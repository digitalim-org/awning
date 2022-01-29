import { Properties } from "https://esm.sh/csstype/index.d.ts";
import logger from "../logger/mod.ts";
import { client, server } from "../utils/is.ts";

interface Classname {
  [index: string]: string;
}

export const stylesheets: [number, string][] = [];

const normalizeCSSProp = (prop: string) =>
  prop.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const media = (breakpoint: string) =>
  `@media (min-width: ${breakpoint})`;

export enum STATE {
  HOVER = "hover",
}

type AtRule = Record<string, Properties>;
type AtRuleSet = [string, string, Properties];
type StateRuleSet = [string, string, Properties];

const stringifyAtRuleSets = (atRuleSets: AtRuleSet[]): string => {
  return atRuleSets.reduce((resultStr, [className, atRule, ruleSet]) => {
    return resultStr +
      `${atRule} {.${className} {${stringifyRuleSet(ruleSet)}}}`;
  }, "");
};

const stringifyStateRuleSets = (stateRuleSets: StateRuleSet[]): string => {
  return stateRuleSets.reduce((resultStr, [className, state, ruleSet]) => {
    return resultStr +
      `.${className}:${state} {${stringifyRuleSet(ruleSet)}}`;
  }, "");
};

const stringifyRuleSet = (ruleSet: Properties): string => {
  return Object.entries(ruleSet).reduce((resultStr, [prop, val]) => {
    return resultStr + `${normalizeCSSProp(prop)}: ${val};`;
  }, "");
};

const stringifyRuleSetAndAtRuleSets = (
  ruleSet: Properties,
  className: string,
): { rules: string; atRules: string; stateRules: string } => {
  const atRuleSets: AtRuleSet[] = [];
  const stateRuleSets: StateRuleSet[] = [];
  const rules = Object.entries(ruleSet).reduce(
    (resultStr, [prop, val]) => {
      if (prop[0] === "@") {
        atRuleSets.push([className, prop, val]);
        return resultStr;
      } else if (prop === STATE.HOVER) {
        stateRuleSets.push([className, prop, val]);
        return resultStr;
      } else {
        return resultStr + `${normalizeCSSProp(prop)}: ${val};`;
      }
    },
    "",
  );

  return {
    stateRules: stringifyStateRuleSets(stateRuleSets),
    rules,
    atRules: stringifyAtRuleSets(atRuleSets),
  };
};

let marker = 0;
export const css = (obj: Record<string, Properties | AtRule>): Classname =>
  Object.entries(obj).reduce((resultClassnames, [className, ruleSet]) => {
    // const generatedClassName = `_${marker++}`;
    const generatedClassName = className;
    const { rules, atRules, stateRules } = stringifyRuleSetAndAtRuleSets(
      ruleSet,
      generatedClassName,
    );

    server(() => {
      console.log("pushing stylesheets for ", generatedClassName);
      stylesheets.push([
        marker,
        `.${generatedClassName}{${rules}} ${atRules} ${stateRules}`,
      ]);
    });

    // client(() => {
    //   let existingStyles: HTMLStyleElement | null = document.querySelector(
    //     `[data-styles-id="${marker}"]`,
    //   );

    //   if (!existingStyles) {
    //     existingStyles = document.createElement("style");
    //     existingStyles.dataset.stylesId = String(marker);
    //     document.head.appendChild(existingStyles);
    //   } else {
    //     existingStyles.sheet!.deleteRule(0);
    //   }

    //   existingStyles.sheet!.insertRule(`.${generatedClassName}{${rules}}`);
    //   if (atRules) {
    //     existingStyles.sheet!.insertRule(atRules);
    //   }
    // });

    return {
      ...resultClassnames,
      [className]: generatedClassName,
    };
  }, {});
