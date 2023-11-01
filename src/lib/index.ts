import { InputValues } from "@google-labs/breadboard";
import weaviate, { WeaviateClient } from "weaviate-ts-client";
import fs from 'fs/promises';

type Document = Record<string, unknown>;

// Function to validate inputs
function validateInputs(inputs: InputValues) {
    if (!('dataFile' in inputs)) {
        throw new Error('dataFile is missing in inputs');
    }
    if (!('weaviateHost' in inputs)) {
        throw new Error('weaviateHost is missing in inputs');
    }
    if (!('className' in inputs)) {
        throw new Error('className is missing in inputs');
    }
}

// Function to read data from file
async function readDataFromFile(dataFile: string) {
    const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
    return data;
}


// Function to batch objects
function batchObjects(client: WeaviateClient, data: Document[], className: string) {
    const batcher = client.batch.objectsBatcher();
    for (const d of data) {
        batcher.withObject({
            class: className,
            properties: d
        });
    }
    return batcher;
}

// Function to count successful results
function countSuccessfulResults(results: Document[]) {
    const successCount = results
        .filter(obj => obj.result['status'] === 'SUCCESS')
        .length;
    return successCount;
}

/**
 * Indexes documents into a Weaviate instance.
 * 
 * @param {InputValues} inputs - An object containing the necessary parameters.
 * @param {string} inputs.dataFile - The path to the JSON file containing the documents to be indexed.
 * @param {string} inputs.weaviateHost - The host address of the Weaviate instance.
 * @param {string} inputs.className - The name of the class in Weaviate where the documents will be indexed.
 * 
 * @returns {Promise<{ totalIndexedDocuments: number }>} - A promise that resolves to an object containing the total number of successfully indexed documents.
 * 
 * @throws {Error} - Throws an error if any of the necessary parameters is missing in `inputs`.
 * 
 * @async
 */
export async function index(inputs: InputValues) {
    validateInputs(inputs);

    const { dataFile, weaviateHost, className } = inputs;

    const data: Document[] = await readDataFromFile(dataFile.toString());

    const client = weaviate.client({
        scheme: 'http',
        host: weaviateHost.toString(),
    })

    const batcher = batchObjects(client, data, className.toString());

    const results = await batcher.do();
    const totalIndexedDocuments = countSuccessfulResults(results);

    return { totalIndexedDocuments };
}

