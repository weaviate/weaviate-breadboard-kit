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
});

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
        const kit = board.addKit(WeaviateKit);

        kit
            .query()
            .wire("weaviateHost<-", board.input())
            .wire("PALM_KEY<-palmApiKey", board.input())
            .wire("query<-", board.input())
            .wire("alpha<-", board.input())
            .wire("className<-", board.input())
            .wire("fields<-", board.input())
            .wire("->searchResults", board.output());

        const results = await board.runOnce(inputs);
        const actualTitle = results.searchResults[0].title;

        expect(actualTitle).toEqual(expectedTitle);
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
        const kit = board.addKit(WeaviateKit);

        kit
            .query()
            .wire("weaviateHost<-", board.input())
            .wire("PALM_KEY<-palmApiKey", board.input())
            .wire("rawQuery<-", board.input())
            .wire("->searchResults", board.output());

        const results = await board.runOnce(inputs);
        const actualTitle = results.searchResults[0].title;

        expect(actualTitle).toEqual(expectedTitle);
    });
});