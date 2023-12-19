import { Board } from "@google-labs/breadboard";
import WeaviateKit from "../../src/index";
import { WeaviateTestManager } from "../testUtils";
import fs from 'fs/promises';


const weaviateTestManager = new WeaviateTestManager();

beforeEach(async () => {
    await weaviateTestManager.deployWeaviate();

});

afterEach(async () => {

    if (weaviateTestManager.environment) {
        await weaviateTestManager.environment.down();
    }
});

describe("index node tests", () => {
    test("all documents end up in weaviate", async () => {
        const inputs = {
            dataFile: "./tests/data.json",
            weaviateHost: "localhost:8080",
            className: "Book",
        };

        const docs = JSON.parse(await fs.readFile(inputs.dataFile.toString(), 'utf-8'));
        const docCount = docs.length;


        const board = new Board();
        const kit: WeaviateKit = board.addKit(WeaviateKit);

        const index = kit.index();

        const input = board.input({
            schema: {
                type: "object",
                properties: {
                    dataFile: {
                        type: "string",
                    },
                    weaviateHost: {
                        type: "string",
                    },
                    className: {
                        type: "string",
                    },
                },
            },
        });
        input.wire("dataFile", index);
        input.wire("weaviateHost", index);
        input.wire("className", index);

        index.wire("*", board.output());

        const result = await board.runOnce(inputs);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Object);
        expect(result.totalIndexedDocuments).toBeDefined();
        expect(result.totalIndexedDocuments).toBe(docCount);
    });

    test("all documents end up in weaviate verbosely using separate inputs", async () => {
        const inputs = {
            dataFile: "./tests/data.json",
            weaviateHost: "localhost:8080",
            className: "Book",
        };

        const docs = JSON.parse(
            await fs.readFile(inputs.dataFile.toString(), "utf-8"),
        );
        const docCount = docs.length;

        const board = new Board();
        const kit: WeaviateKit = board.addKit(WeaviateKit);

        const index = kit.index();
        (board.input({
            schema: {
                type: "object",
                properties: {
                    dataFile: {
                        type: "string",
                    },
                },
            },
        })).wire("dataFile", index);

        (board.input({
            schema: {
                type: "object",
                properties: {
                    weaviateHost: {
                        type: "string",
                    },
                },
            },
        })).wire("weaviateHost", index);

        (board.input({
            schema: {
                type: "object",
                properties: {
                    className: {
                        type: "string",
                    },
                },
            },
        })).wire("className", index);

        index.wire("*", board.output());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: any[] = [];
        for await (const result of board.run({
            // probe: new LogProbe(),
        })) {
            if (result.type === "input") {
                result.inputs = inputs;
            } else if (result.type === "output") {
                results.push(result.outputs);
            }
        }
        expect(results).toBeDefined();
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeGreaterThan(0);
        expect(results.some((result) => result.totalIndexedDocuments && result.totalIndexedDocuments === docCount)).toBe(true);
    });
});

