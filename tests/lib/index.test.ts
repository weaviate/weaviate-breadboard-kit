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
}, 10000);

describe("index node tests", () => {
    test("all documents end up in weaviate", async () => {
        const inputs = {
            dataFile: "./tests/data.json",
            weaviateHost: "localhost:8080",
            palmApiKey: process.env.PALM_APIKEY,
            className: "Book",
        };

        const docs = JSON.parse(await fs.readFile(inputs.dataFile.toString(), 'utf-8'));
        const docCount = docs.length;


        const board = new Board();
        const kit = board.addKit(WeaviateKit);

        kit
            .index()
            .wire("dataFile<-", board.input())
            .wire("weaviateHost<-", board.input())
            .wire("PALM_KEY<-palmApiKey", board.input())
            .wire("className<-", board.input())
            .wire("->totalIndexedDocuments", board.output());

        const results = await board.runOnce(inputs);
        expect(results.totalIndexedDocuments).toBe(docCount);
    });

    // Add more tests for the "index" node here
});


