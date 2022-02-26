/** @jsxImportSource https://esm.sh/preact */
import {
  Application,
  httpErrors,
  Router,
  send,
} from "https://deno.land/x/oak@v10.4.0/mod.ts";
import { join, parse } from "https://deno.land/std@0.117.0/path/mod.ts";
// import { ensureFile,  } from "https://deno.land/std@0.117.0/fs/mod.ts";
import { getDirname } from "./utils/mod.ts";
import logger from "./logger/mod.ts";
import Head from "./components/core/Head.tsx";
import App from "./components/core/App.tsx";
import {
  ComponentType,
  debounce,
  ExtendableProps,
  renderToString,
} from "./deps.ts";
import { readFileSync, titleCase } from "./utils/mod.ts";
import { stylesheets } from "./styling/builder.ts";
import { isDev } from "./utils/is.ts";
import { Database, Model } from "./db/mod.ts";
import { RouteContext } from "./router/mod.tsx";

const awningRoot = getDirname(import.meta.url);
const awningComponents = `${awningRoot}/components`;

export type AwningPageProps = ExtendableProps<{
  session: SessionData;
}>;

interface RouteConfig {
  component: ComponentType<AwningPageProps>;
}

export interface AwningConfiguration {
  port?: number;
  root: string;
  routes: Record<string, string | RouteConfig>;
  models?: typeof Model[];
}

export interface SessionData {
  currentRoute: string | null;
}

export default async ({
  port = 5555,
  root,
  routes,
  models,
}: AwningConfiguration) => {
  interface Ctx {
    foo: string;
  }
  const app = new Application<Ctx>();

  app.use(async ({ request, response }, next) => {
    logger.debug(`request-url: ${request.url}`);
    await next();
  });

  const sessionData: SessionData = {
    currentRoute: null,
  };
  app.use(async ({ request }, next) => {
    sessionData.currentRoute = request.url.pathname;
    await next();
  });

  const router = new Router();

  const UserlandHead = (await import(`${root}/components/Head.tsx`)).default;

  const pages = Array.from(
    Deno.readDirSync(join(root, "components", "pages")),
  ).map((page) => page.name);

  // Object.entries(routes).forEach(([route, nameOrConfig]) => {
  pages.forEach((page) => {
    const pageName = parse(page).name.toLowerCase();
    const isIndex = pageName === "index";
    const route = isIndex ? "/" : `/${pageName}`;

    router.get(
      route,
      async ({ request, response, ...context }, next) => {
        const Page = (await import(
          `${root}/components/pages/${page}`
        )).default;

        const body = renderToString(
          <App
            url={request.url.pathname}
            root={root}
            pages={[{ route, component: Page }]}
          />,
        );

        const styles = stylesheets.map(([marker, ss]) =>
          `<style data-styles-id="${marker}">${ss}</style>`
        ).join("");

        const head = renderToString(
          <Head>
            <UserlandHead />
          </Head>,
        );

        response.body = `
        <!DOCTYPE html>
        <html>
          <head>
            ${styles}
            <script>
              ${isDev && "window.AWNING_DEV = true;"}
              window.pages = [${pages.map((page) => `"${page}"`)}]
            </script>
            ${head}
          </head>
          <body>
            ${body}
          </body>
        </html>
      `;

        await next();
      },
    );
  });

  router.get("/sync", async (ctx, next) => {
    if (ctx.isUpgradable) {
      const ws = await ctx.upgrade();

      const watcher = Deno.watchFs([
        `${root}/components`,
        `${awningRoot}/components`,
      ]);

      const safeCloseWatcher = () => {
        try {
          watcher.close();
        } catch {
          logger.debug("watcher failed to close");
        }
      };

      ws.onclose = (ev) => {
        console.log("ws close");
        safeCloseWatcher();
      };

      ws.onerror = (ev: Event & { message?: string }) => {
        console.log("ws error", ev.message);
        safeCloseWatcher();
      };

      ws.onmessage = console.log;

      const notify = debounce((event) => {
        logger.debug("watched file modified - sending reload");
        ws.send(JSON.stringify({
          cmd: "reload",
        }));
      }, 200);

      for await (const event of watcher) {
        if (event.kind === "modify") {
          notify(event);
        }
      }
    } else {
      ctx.throw(500);
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(async (ctx, next) => {
    if (ctx.response.body) {
      return next();
    }

    const { pathname } = ctx.request.url;
    const { ext, dir } = parse(pathname);
    console.log("hit here", pathname);
    if ([".ts", ".tsx"].includes(ext)) {
      try {
        const filePath = `${awningRoot}/public${pathname}`;
        await Deno.stat(filePath);
        try {
          const bundle = await Deno.emit(filePath, {
            check: false,
            bundle: "module",
            compilerOptions: {
              jsxFactory: "h",
              jsxImportSource: "https://esm.sh/preact",
            },
          });
          ctx.response.body = bundle.files["deno:///bundle.js"];
          ctx.response.type = ".js";
        } catch (e) {
          ctx.throw(e);
        }
      } catch (e) {
        const filePath = `${root}${pathname}`;
        await Deno.stat(filePath);
        const bundle = await Deno.emit(filePath, {
          bundle: "module",
          check: false,
          compilerOptions: {
            jsxFactory: "h",
            jsxImportSource: "https://esm.sh/preact",
          },
        });
        ctx.response.body = bundle.files["deno:///bundle.js"];
        ctx.response.type = ".js";
      }
    } else {
      if (/^\/awning\//.test(dir)) {
        try {
          // Slice off /awning/public
          await send(ctx, pathname.slice(14), { root: `${awningRoot}/public` });
        } catch (e) {
          if (e instanceof httpErrors.NotFound) {
            ctx.throw(404);
          }
          logger.error(e);
        }
      } else {
        try {
          await ctx.send({ root: `${root}/public` });
        } catch (e) {
          if (e instanceof httpErrors.NotFound) {
            ctx.throw(404);
          }
          logger.error(e);
        }
      }
    }
  });

  app.addEventListener("listen", ({ port }) => {
    logger.info(`Listening on port ${port}`);
  });

  app.listen({ port });
};
