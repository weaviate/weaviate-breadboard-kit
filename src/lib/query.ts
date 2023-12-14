import { InputValues, OutputValues } from "@google-labs/breadboard";
import { createWeaviateClient } from "./weaviate-client";

function validateInputs(inputs: InputValues) {
    if (!('weaviateHost' in inputs)) {
        throw new Error('weaviateHost is missing in inputs');
    }
    if (!('query' in inputs)) {
        throw new Error('query is missing in inputs');
    }
    if (!('alpha' in inputs)) {
        throw new Error('alpha is missing in inputs');
    }
    if (!('className' in inputs)) {
        throw new Error('className is missing in inputs');
    }
    if (!('fields' in inputs)) {
        throw new Error('fields is missing in inputs');
    }
}

/**
 * Executes a query on a Weaviate instance using hybrid search and returns the search results.
 *
 * @param {InputValues} inputs - The inputs for the query. This includes:
 *   - weaviateHost: The host address of the Weaviate instance.
 *   - query: The query to execute.
 *   - alpha: The hybrid search's alpha parameter (between 0 and 1). 0 means BM25 search only, 1 means vector search only.
 *   - className: The name of the class in Weaviate to query.
 *   - fields: A string of fields to return in the query results.
 *
 * @returns {Promise<{searchResults: OutputValues}>} - A promise that resolves to an object containing the search results.
 *   The search results are the data returned by the Weaviate instance for the given query.
 *
 * @throws {Error} - Throws an error if there is a problem executing the query.
 *
 * @async
 */
export async function query(inputs: InputValues): Promise<{searchResults: OutputValues}> {
    validateInputs(inputs);

    const { weaviateHost, query, alpha, className, fields, weaviateApiKey, PALM_KEY } = inputs;

    const client = createWeaviateClient(
        weaviateHost.toString(),
        PALM_KEY.toString(),
        weaviateApiKey ? weaviateApiKey.toString() : undefined
    );

    const q = client.graphql
        .get()
        .withClassName(className.toString())
        .withFields(fields.toString())
        .withHybrid({
            query: query.toString(),
            alpha: Number(alpha.valueOf())
        });

    try {
        const results = await q.do();

        const searchResults = results.data.Get[className.toString()];

        return {"searchResults": searchResults};

    } catch (error) {
        console.error(`Failed to execute query: ${error}`);
        throw error;
    }
}