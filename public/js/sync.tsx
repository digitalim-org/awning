import { h, render } from "../../deps.ts";

const ws = new WebSocket("ws://localhost:5555/sync");
ws.onerror = console.log;
ws.onopen = console.log;
ws.onclose = () => {
};

let cacheBust = Date.now();
ws.onmessage = async ({ data }) => {
  const { cmd } = JSON.parse(data);
  if (cmd === "reload") {
    const bundle = await import(`/components/Index.tsx?_=${cacheBust++}`);
    const Component = bundle.default;
    // const { render } = bundle;
    console.log(<Component />);
    render(
      <Component />,
      document.querySelector("body")!,
    );
  }
};
