import * as log from "https://deno.land/std@0.117.0/log/mod.ts";
import { isDev } from "../utils/is.ts";

const logLevel: log.LevelName = isDev ? "DEBUG" : "INFO";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler(logLevel),
  },
  loggers: {
    awning: {
      level: logLevel,
      handlers: ["console"],
    },
  },
});

export default log.getLogger("awning");
