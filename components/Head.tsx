/** @jsxImportSource https://esm.sh/preact */
import { RenderableProps } from "../deps.ts";

interface HeadProps {
  title?: string;
}

const Head = ({ children }: RenderableProps<HeadProps>) => (
  <>
    <link
      rel="stylesheet"
      href="https://unpkg.com/normalize.css@8.0.1/normalize.css"
    />
    {children}
    <title>foo</title>
  </>
);

export default Head;
