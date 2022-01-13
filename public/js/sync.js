onmessage = console.log;

const ws = new WebSocket("ws://localhost:5555/sync");
ws.onerror = console.log;
ws.onopen = console.log;
ws.onclose = () => {
  postMessage("reload");
};
ws.onmessage = console.log;
