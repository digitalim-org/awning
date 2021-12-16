import * as log from "https://deno.land/std@0.117.0/log/mod.ts";

const logLevel = "INFO";

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
