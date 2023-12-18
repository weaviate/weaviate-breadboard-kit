import { Board } from "@google-labs/breadboard";
import WeaviateKit from "../../src/index";
import { WeaviateTestManager } from "../testUtils";

const weaviateTestManager = new WeaviateTestManager();

beforeEach(async () => {
    await weaviateTestManager.deployWeaviate();
    await weaviateTestManager.importData();

});

afterEach(async () => {

    if (weaviateTestManager.environment) {
        await weaviateTestManager.environment.down();
    }
}, 10000);

describe("query node tests", () => {
    test("search Harry Potter using vector search", async () => {
        const inputs = {
            weaviateHost: "localhost:8080",
            palmApiKey: process.env.PALM_APIKEY,
            query: `
                a novice sorcerer uncovering his mystical lineage 
                while confronting adversities in his inaugural year 
                at an enchanted institution.
            `,
            alpha: 1,
            className: "Book",
            fields: "title summary"
        };

        const expectedTitle = "Harry Potter and the Sorcerer's Stone";

        const board = new Board();
        const kit: WeaviateKit = board.addKit(WeaviateKit);

        const query = kit.query();

        const input = board.input({
            schema: {
                type: "object",
                properties: {
                    weaviateHost: {
                        type: "string",
                    },
                    query: {
                        type: "string",
                    },
                    alpha: {
                        type: "number",
                    },
                    className: {
                        type: "string",
                    },
                    fields: {
                        type: "string",
                    },
                    palmApiKey:{
                        type: "string",
                    }
                },
            },
        });

        input.wire("weaviateHost", query);
        input.wire("query", query);
        input.wire("alpha", query);
        input.wire("className", query);
        input.wire("fields", query);
        input.wire("palmApiKey->PALM_KEY", query);

        query.wire("*", board.output());

        const results = await board.runOnce(inputs);

        expect(results).toBeDefined();
        expect(results).toBeInstanceOf(Object);
        expect(results.searchResults).toBeDefined();
        expect(results.searchResults).toBeInstanceOf(Array);
        expect((results.searchResults as []).length).toBeGreaterThan(0);
        expect(results.searchResults![0].title).toEqual(expectedTitle);
    });

    test("search using raw graphql query", async () => {
        const inputs = {
            weaviateHost: "localhost:8080",
            palmApiKey: process.env.PALM_APIKEY,
            rawQuery: `
            {
                Get {
                  Book(where: {
                    path: ["title"],
                    operator: Equal,
                    valueText: "To Kill a Mockingbird"
                  }) {
                      title
                      summary
                  }
                }
              }
            `
        };

        const expectedTitle = "To Kill a Mockingbird";

        const board = new Board();
        const kit: WeaviateKit = board.addKit(WeaviateKit);

        const query = kit.query();

        const input = board.input({
            schema: {
                type: "object",
                properties: {
                    weaviateHost: {
                        type: "string",
                    },
                    rawQuery: {
                        type: "string",
                    },
                    palmApiKey:{
                        type: "string",
                    }
                },
            },
        });
        input.wire("weaviateHost", query);
        input.wire("rawQuery", query);
        input.wire("palmApiKey->PALM_KEY", query);

        query.wire("*", board.output());

        const results = await board.runOnce(inputs);

        expect(results).toBeDefined();
        expect(results).toBeInstanceOf(Object);
        expect(results.searchResults).toBeDefined();
        expect(results.searchResults).toBeInstanceOf(Array);
        expect((results.searchResults as []).length).toBeGreaterThan(0);
        expect(results.searchResults![0].title).toEqual(expectedTitle);
    });
});
