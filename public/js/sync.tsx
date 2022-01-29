import { h, render } from "../../deps.ts";

const sync = () => {
  const ws = new WebSocket("ws://localhost:5555/sync");
  ws.onerror = console.log;
  // ws.onopen = console.log;
  ws.onclose = () => {
    console.log("closing so resyncing");
    setTimeout(sync, 2000);
  };

  let cacheBust = Date.now();
  ws.onmessage = ({ data }) => {
    location.reload();
    // const { cmd } = JSON.parse(data);
    // if (cmd === "reload") {
    //   const bundle = await import(`/components/Index.tsx?_=${cacheBust++}`);
    //   const Index = bundle.default;
    //   render(
    //     <Index />,
    //     document.querySelector("body")!,
    //   );
    // }
  };
};

sync();
