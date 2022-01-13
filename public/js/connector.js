const syncWorker = new Worker("js/sync.js");

syncWorker.onmessage = (cmd) => {
  if (cmd === "reload") {
    window.reload;
  }
};
