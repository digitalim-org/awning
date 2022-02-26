/** @jsxImportSource https://esm.sh/preact */
import { ExtendableProps } from "../../deps.ts";

interface HeadProps {
  title?: string;
}

const Head = ({ children, title }: ExtendableProps<HeadProps>) => (
  <>
    {
      /* <script
      type="module"
      src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
    /> */
    }
    <script src="js/sync.tsx"></script>
    <script src="js/hydrate-root.tsx" type="module"></script>
    <link
      rel="stylesheet"
      href="/awning/public/css/common.css"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/normalize.css@8.0.1/normalize.css"
    />
    {children}
    <title>{title}</title>
  </>
);

export default Head;
