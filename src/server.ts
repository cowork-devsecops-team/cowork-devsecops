import { createApp } from "./app";
import { config } from "./config";

createApp().listen(config.port, () => {
  console.log(JSON.stringify({ level: "info", msg: "server_started", port: config.port }));
});
