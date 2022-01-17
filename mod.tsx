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
import Head from "./components/Head.tsx";
import {
  ComponentType,
  debounce,
  RenderableProps,
  renderToString,
} from "./deps.ts";
import { readFileSync, titleCase } from "./utils/mod.ts";

const awningRoot = getDirname(import.meta.url);
const awningComponents = `${awningRoot}/components`;

export type AwningPageProps = RenderableProps<{
  session: SessionData;
}>;

interface RouteConfig {
  component: ComponentType<AwningPageProps>;
  css: string;
}

export interface AwningConfiguration {
  port?: number;
  root: string;
  routes: Record<string, string | RouteConfig>;
  dev?: boolean;
}

export interface SessionData {
  currentRoute: string | null;
}

export default ({
  port = 5555,
  root,
  routes,
  dev = false,
}: AwningConfiguration) => {
  interface Ctx {
    foo: string;
  }
  const app = new Application<Ctx>();

  app.use(async ({ request, response }, next) => {
    logger.debug(request);
    await next();
    logger.debug(response);
  });

  const sessionData: SessionData = {
    currentRoute: null,
  };
  app.use(async ({ request }, next) => {
    sessionData.currentRoute = request.url.pathname;
    await next();
  });

  const router = new Router();

  // if (dev) {
  // } else {
  // for (const component of Deno.readDirSync(awningComponents)) {
  //   if (component.isFile) {
  //     const { name } = parse(component.name);
  //     const templfn = compile(
  //       decoder.decode(
  //         Deno.readFileSync(`${awningComponents}/${component.name}`),
  //       ),
  //     );
  //     templates.define(name, templfn);
  //   } else {
  //     throw new Error(`${component.name} should be a component file`);
  //   }
  // }
  // }

  Object.entries(routes).forEach(async ([route, nameOrConfig]) => {
    let resolvedRouteData: RouteConfig;

    switch (typeof nameOrConfig) {
      case "string":
        resolvedRouteData = {
          component:
            (await import(`${root}/components/${titleCase(nameOrConfig)}.tsx`))
              .default,
          css: readFileSync(`${root}/css/${nameOrConfig.toLowerCase()}.css`),
        };
        break;
      case "object":
        resolvedRouteData = nameOrConfig;
        break;
      default:
        throw new Error(
          `Expected string or object but RouteConfig is ${typeof nameOrConfig}.`,
        );
    }

    const UserlandHead = (await import(`${root}/components/Head.tsx`)).default;

    let commonCSS = "";
    try {
      commonCSS = readFileSync(`${root}/css/common.css`);
    } catch (_e) {
      logger.info("No common.css file used.");
    }

    router.get(route, async ({ response, ...context }, next) => {
      response.body = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              ${commonCSS}
              ${resolvedRouteData.css}
            </style>
            ${
        renderToString(
          <Head>
            <UserlandHead />
          </Head>,
        )
      }
          </head>
          <body>
            ${
        renderToString(
          <resolvedRouteData.component session={{ currentRoute: route }} />,
        )
      }
          </body>
        </html>
      `;

      await next();
    });
  });

  router.get("/sync", async (ctx, next) => {
    if (ctx.isUpgradable) {
      const ws = await ctx.upgrade();

      // ws.onclose = console.log;
      // ws.onerror = console.log;
      // ws.onmessage = console.log;

      const watcher = Deno.watchFs([
        `${root}/components`,
      ], {
        recursive: true,
      });

      const notify = debounce((event) => {
        console.log("after", event);
        ws.send(JSON.stringify({
          cmd: "reload",
        }));
      }, 200);

      for await (const event of watcher) {
        console.log("before", event);
        notify(event);
      }
    } else {
      ctx.throw(500);
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(async (ctx) => {
    const { pathname } = ctx.request.url;
    const { ext, base } = parse(pathname);
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
        debugger;
        ctx.response.body = bundle.files["deno:///bundle.js"];
        ctx.response.type = ".js";
      }
    } else {
      try {
        await ctx.send({ root: `${root}/public` });
      } catch {
        await ctx.send({ root: `${awningRoot}/public` });
      }
    }
  });

  app.addEventListener("listen", ({ port }) => {
    logger.info(`Listening on port ${port}`);
  });

  app.listen({ port });
};
