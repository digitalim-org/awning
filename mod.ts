// declare global {
//   interface Window {
//     // deno-lint-ignore no-explicit-any
//     getData: (key: string) => any;
//   }
// }

import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v10.0.0/mod.ts";
import { parse } from "https://deno.land/std@0.117.0/path/mod.ts";
// import { ensureFile } from "https://deno.land/std@0.117.0/fs/mod.ts";
import {
  compile,
  config,
  configure,
  render,
  renderFile,
  templates,
} from "https://deno.land/x/eta@v1.12.3/mod.ts";
import { getDirname } from "./utils/mod.ts";
import logger from "./logger/mod.ts";

const layoutShell = "<% layout('shell') %>";

const awningRoot = getDirname(import.meta.url);
const awningComponents = `${awningRoot}/components`;

export interface AwningConfiguration {
  port?: number;
  root: string;
  routes: Record<string, string>;
  dev?: boolean;
}

interface PageContainerProps {
  title: string;
}

interface Ctx {}

export default async ({
  port = 5555,
  root,
  routes,
  dev = false,
}: AwningConfiguration) => {
  const app = new Application<Ctx>();

  app.use(async ({ request, response }, next) => {
    logger.debug(request);
    await next();
    logger.debug(response);
  });

  interface sessionDataIface {
    currentRoute: string | null;
  }

  const sessionData: sessionDataIface = {
    currentRoute: null,
  };
  app.use(async ({ request }, next) => {
    sessionData.currentRoute = request.url.pathname;
    await next();
  });

  const router = new Router();

  const userlandData = (await import(`${root}/data/mod.ts`)).default;

  // deno-lint-ignore ban-types
  const withCustomContext = (fn: Function) => {
    return (name: string, data: Record<string, unknown>) => {
      const resolvedData = data &&
        Object.entries(data).reduce((obj, [key, val]) => ({
          ...obj,
          [key]: typeof val === "function" ? val(userlandData) : val,
        }), {});
      return fn.call(config, name, { ...resolvedData, session: sessionData });
    };
  };

  configure({
    root,
    varName: "ctx",
    // rmWhitespace: true,
    views: [`${root}/views`, `${awningRoot}/views`],
    includeFile: withCustomContext(config.includeFile!),
    // includeFile: config.includeFile!,
  });

  // window.getData = (key) => {
  //   return data.default[key];
  // };

  if (dev) {
    configure({
      // Proxy calls for include to includeFile since we are not caching templates in dev.
      include: config.includeFile,
      views: config.views!.concat(awningComponents),
    });
  } else {
    configure({
      cache: true,
    });

    const decoder = new TextDecoder("utf-8");
    for (const component of Deno.readDirSync(awningComponents)) {
      if (component.isFile) {
        const { name } = parse(component.name);
        const templfn = compile(
          decoder.decode(
            Deno.readFileSync(`${awningComponents}/${component.name}`),
          ),
        );
        templates.define(name, templfn);
      } else {
        throw new Error(`${component.name} should be a component file`);
      }
    }
  }

  Object.entries(routes).forEach(([route, view]) => {
    router.get(route, async ({ response, ...ctx }, next) => {
      sessionData;
      logger.debug(config.templates);
      const viewURL = `${view}.eta`;
      try {
        response.body = await render(
          `
        ${layoutShell} 
        ${await renderFile(viewURL, { bar: "quuux" }, {
            filename: viewURL,
            foo: "bar",
          })}
      `,
          { foob: "quux" },
          {
            name: view,
          },
        ) as string;
      } catch (e) {
        logger.error(e);
      }

      await next();
    });
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${root}/public`,
      // index: "index.html",
    });
  });

  app.addEventListener("listen", ({ port }) => {
    logger.info(`Listening on port ${port}`);
  });

  app.listen({ port });
};
