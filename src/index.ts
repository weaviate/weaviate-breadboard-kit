import { KitBuilder } from "@google-labs/breadboard/kits";
import { index } from "./lib/index";
import { query } from "./lib/query";


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


// Necessary for Breadboard to import it as a Kit when loading boards
export default WeaviateKit;
// Necessary for TypeScript to recognize the type of the Kit
export type WeaviateKit = InstanceType<typeof WeaviateKit>;
// Optionally, export it as a named export
export { WeaviateKit };

