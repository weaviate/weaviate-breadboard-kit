import { InputValues, NodeValue, OutputValues } from "@google-labs/breadboard";
import { GraphQLGetter, Raw } from "weaviate-ts-client";
import { createWeaviateClient } from "./weaviate-client.js";

function validateInputs(inputs: InputValues) {
  if (!("weaviateHost" in inputs)) {
    throw new Error("weaviateHost is missing in inputs");
  }

  if ("rawQuery" in inputs) {
    return;
  }

  if (!("query" in inputs)) {
    throw new Error("query is missing in inputs");
  }
  if (!("alpha" in inputs)) {
    throw new Error("alpha is missing in inputs");
  }
  if (!("className" in inputs)) {
    throw new Error("className is missing in inputs");
  }
  if (!("fields" in inputs)) {
    throw new Error("fields is missing in inputs");
  }
}

/**
 * Executes a query on a Weaviate instance using hybrid search or a weaviate graphql query and returns the search results.
 *
 * @param {InputValues} inputs - The inputs for the query. This includes:
 *   - weaviateHost: The host address of the Weaviate instance.
 *   - query: The query to execute.
 *   - alpha: The hybrid search's alpha parameter (between 0 and 1). 0 means BM25 search only, 1 means vector search only.
 *   - className: The name of the class in Weaviate to query.
 *   - fields: A string of fields to return in the query results.
 *   - weaviateApiKey: The API key to use to authenticate with the Weaviate instance.
 *   - PALM_KEY: The API key to use to authenticate to the Google PaLM API service.
 *   - rawQuery: A weaviate graphql get query to execute instead of a hybrid search query. It is unnecessary to provide the
 *               other search inputs if this is provided.
 *
 * @returns {Promise<{searchResults: OutputValues}>} - A promise that resolves to an object containing the search results.
 *   The search results are the data returned by the Weaviate instance for the given query.
 *
 * @throws {Error} - Throws an error if there is a problem executing the query.
 *
 * @async
 */
export async function query(
  inputs: InputValues,
): Promise<{ searchResults: OutputValues }> {
  validateInputs(inputs);

  const {
    weaviateHost,
    query,
    alpha,
    className,
    fields,
    weaviateApiKey,
    rawQuery,
  } = inputs;

  const client = createWeaviateClient(
    weaviateHost.toString(),
    weaviateApiKey ? weaviateApiKey.toString() : undefined,
  );

  let q: GraphQLGetter | Raw;
  if (rawQuery) {
    q = client.graphql.raw().withQuery(rawQuery.toString());
  } else {
    q = client.graphql
      .get()
      .withClassName(className.toString())
      .withFields(fields.toString())
      .withHybrid({
        query: query.toString(),
        alpha: Number(alpha.valueOf()),
      });
  }

  try {
    const results = await q.do();

    const searchResults = Object.values(results.data.Get)[0] as Partial<
      Record<string, NodeValue>
    >;

    return { searchResults: searchResults };
  } catch (error) {
    console.error(`Failed to execute query: ${error}`);
    throw error;
  }
}
