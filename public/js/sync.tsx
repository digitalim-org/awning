import { h, render } from "../../deps.ts";

const sync = () => {
  const ws = new WebSocket("ws://localhost:5555/sync");
  ws.onerror = console.log;
  ws.onopen = console.log;
  ws.onclose = () => {
    console.log("closing so resyncing");
    sync();
  };

  let cacheBust = Date.now();
  ws.onmessage = async ({ data }) => {
    const { cmd } = JSON.parse(data);
    if (cmd === "reload") {
      const bundle = await import(`/components/Index.tsx?_=${cacheBust++}`);
      const Component = bundle.default;
      render(
        <Component />,
        document.querySelector("body")!,
      );
    }
  };
};

sync();
