/** @jsxImportSource https://esm.sh/preact */
import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { parse } from "https://deno.land/std@0.117.0/path/mod.ts";
// import { ensureFile } from "https://deno.land/std@0.117.0/fs/mod.ts";
import { getDirname } from "./utils/mod.ts";
import logger from "./logger/mod.ts";
import Head from "./components/core/Head.tsx";
import {
  ComponentType,
  debounce,
  RenderableProps,
  renderToString,
} from "./deps.ts";
import { readFileSync, titleCase } from "./utils/mod.ts";
import { stylesheets } from "./styling/builder.ts";
import { isDev } from "./utils/is.ts";
import { Database, Model } from "./db/mod.ts";

const awningRoot = getDirname(import.meta.url);
const awningComponents = `${awningRoot}/components`;

export type AwningPageProps = RenderableProps<{
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

export default ({
  port = 5555,
  root,
  routes,
  models,
}: AwningConfiguration) => {
  interface Ctx {
    foo: string;
  }
  const app = new Application<Ctx>();

  // if (models?.length) {
  //   const { db, createTable } = new Database();
  //   models.forEach(createTable);
  // }

  app.use(async ({ request, response }, next) => {
    logger.debug(`request-url: ${request.url}`);
    await next();
    // logger.debug(response);
  });

  const sessionData: SessionData = {
    currentRoute: null,
  };
  app.use(async ({ request }, next) => {
    sessionData.currentRoute = request.url.pathname;
    await next();
  });

  const router = new Router();

  Object.entries(routes).forEach(async ([route, nameOrConfig]) => {
    // let resolvedRouteData: RouteConfig;

    // switch (typeof nameOrConfig) {
    //   case "string":
    //     resolvedRouteData = {
    //       component:
    //         (await import(`${root}/components/${titleCase(nameOrConfig)}.tsx`))
    //           .default,
    //     };
    //     break;
    //   case "object":
    //     resolvedRouteData = nameOrConfig;
    //     break;
    //   default:
    //     throw new Error(
    //       `Expected string or object but RouteConfig is ${typeof nameOrConfig}.`,
    //     );
    // }

    const UserlandHead = (await import(`${root}/components/Head.tsx`)).default;

    let foo = 0;
    router.get(route, async ({ response, ...context }, next) => {
      console.log(stylesheets);
      const Component = (await import(
        `${root}/components/${titleCase(nameOrConfig as string)}.tsx?${foo++}`
      )).default;

      const rendered = renderToString(
        <Component session={{ currentRoute: route }} />,
      );

      response.body = `
        <!DOCTYPE html>
        <html>
          <head>
            ${
        stylesheets.map(([marker, ss]) =>
          `<style data-styles-id="${marker}">${ss}</style>`
        )
          .join("")
      }
            <script>
            ${
        isDev && `
                window.AWNING_DEV = true;
              `
      }
            </script>
            ${
        renderToString(
          <Head>
            <UserlandHead />
          </Head>,
        )
      }
          </head>
          <body>
            ${rendered}
          </body>
        </html>
      `;

      await next();
    });
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

      ws.onerror = (ev) => {
        console.log("ws error", ev);
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
  app.use(async (ctx) => {
    const { pathname } = ctx.request.url;
    const { ext, dir } = parse(pathname);
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
              // jsx: "react-jsx",
              jsxImportSource: "https://esm.sh/preact",
            },
            // bundle: "module",
            // check: true,
            // sources: {
            //   "Index.tsx": `${root}/components/Index.tsx`,
            // },
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
            // jsx: "react-jsx",
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
          ctx.throw(e);
        }
      } else {
        try {
          await ctx.send({ root: `${root}/public` });
        } catch (e) {
          ctx.throw(e);
        }
      }
    }
  });

  app.addEventListener("listen", ({ port }) => {
    logger.info(`Listening on port ${port}`);
  });

  app.listen({ port });
};
