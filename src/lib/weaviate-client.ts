import weaviate, { ApiKey, WeaviateClient } from 'weaviate-ts-client';

/**
 * Creates a Weaviate client with the specified Weaviate URL and optional API key.
 *
 * @param weaviateUrl The URL of the Weaviate instance to connect to.
 * @param palmApiKey The API key to authenticate into the Google PaLM API service.
 * @param weaviateApiKey The API key to authenticate into the weaviate instance (optional).
 * @returns The Weaviate client.
 *
 * @remarks If the protocol is not specified in the `weaviateUrl`, it defaults to `http`.
 */
export function createWeaviateClient(
  weaviateUrl: string,
  palmApiKey: string,
  weaviateApiKey?: string
): WeaviateClient {
  if (!weaviateUrl.startsWith('http://') && !weaviateUrl.startsWith('https://')) {
    weaviateUrl = 'http://' + weaviateUrl;
  }

  const parsedUrl = new URL(weaviateUrl);
  const scheme = parsedUrl.protocol.replace(':', '');
  const host = parsedUrl.host;

  if (weaviateApiKey) {
    return weaviate.client({
      scheme: scheme,
      host: host,
      apiKey: new ApiKey(weaviateApiKey),
      headers: { 'X-Palm-Api-Key': palmApiKey },
    });
  } else {
    return weaviate.client({
      scheme: scheme,
      host: host,
      headers: { 'X-Palm-Api-Key': palmApiKey },
    });
  }
}
