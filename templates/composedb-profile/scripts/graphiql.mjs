import { serveEncodedDefinition } from "@composedb/devtools-node";

const server = await serveEncodedDefinition({
  ceramicURL: "http://localhost:7007",
  graphiql: true,
  path: "./src/__generated__/definition.json",
  // path: new URL("definition.json", import.meta.url),
  port: 5001,
});

console.log(`Server started on ${server.url}`);

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server stopped");
  });
});
