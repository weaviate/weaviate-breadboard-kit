import { KitBuilder } from "@google-labs/breadboard/kits";
import { index } from "./lib/index.js";
import { query } from "./lib/query.js";

const builder = new KitBuilder({
  url: "npm:weaviate-kit",
  title: "Weaviate Kit",
  description: "A collection of Breadboard nodes for working with Weaviate",
  version: "0.0.1",
});

const WeaviateKit = builder.build({
  // node handlers go here
  index,
  query,
});

// Necessary for TypeScript to recognize the type of the Kit
type WeaviateKit = InstanceType<typeof WeaviateKit>;

// Add named export for kit
export { WeaviateKit };

// Necessary for Breadboard to import it as a Kit when loading boards
export default WeaviateKit;
