/** @jsxImportSource https://esm.sh/preact */
import { ComponentType, ExtendableProps, pathJoin } from "../../deps.ts";
import { Route, RouteContext } from "../../router/mod.tsx";
import { client, server } from "../../utils/is.ts";

interface Page {
  route: string;
  component: ComponentType;
}

interface AppProps {
  url: string;
  root?: string;
  pages: Page[];
}

const App = ({ url, root, pages }: ExtendableProps<AppProps>) => {
  return (
    <RouteContext.Provider value={{ url }}>
      {pages!.map((page) => {
        return (
          <Route exact={page.route}>
            <page.component />
          </Route>
        );
      })}
    </RouteContext.Provider>
  );
};

export default App;
