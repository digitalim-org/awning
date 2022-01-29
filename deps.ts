/** @jsxImportSource https://esm.sh/preact */
import { RenderableProps } from "https://esm.sh/preact@10.6.4";

export type {
  ComponentChildren,
  ComponentType,
  JSX,
  RenderableProps,
  //   ComponentProps,
  // Component,
  VNode,
} from "https://esm.sh/preact@10.6.4";

interface ExtendableAdditions {
  className?: string;
}

export type ExtendableProps<T> = RenderableProps<ExtendableAdditions & T>;

export { h, hydrate, render, toChildArray } from "https://esm.sh/preact@10.6.4";
export { useState } from "https://esm.sh/preact@10.6.4/hooks";
export { default as renderToString } from "https://esm.sh/preact-render-to-string?deps=preact@10.6.4";

export { debounce } from "https://deno.land/std/async/mod.ts";

declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}
