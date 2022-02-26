import { h, hydrate } from "../../deps.ts";
import App from "../../components/core/App.tsx";

const pages = ((window as any).pages as string[])
  .map(async (page) => {
    const component = await import(`../../../components/pages/${page}`);

    return {
      route: page === "Index.tsx"
        ? "/"
        : `/${page.split(".")[0].toLowerCase()}`,
      component: component.default,
    };
  });

Promise.all(pages).then((resolvedPages) => {
  hydrate(
    <App url={window.location.pathname} pages={resolvedPages} />,
    document.querySelector("body")!,
  );
});
