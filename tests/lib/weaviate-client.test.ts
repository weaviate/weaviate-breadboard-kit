import { jest } from '@jest/globals';
import weaviate, { ApiKey, ConnectionParams, WeaviateClient } from 'weaviate-ts-client';
import { createWeaviateClient } from "../../src/lib/weaviate-client";

// Mock the weaviate.client function
let mockedClient: jest.SpiedFunction<(params: ConnectionParams) => WeaviateClient>;

describe("createWeaviateClient", () => {
    const palmApiKey = "testPalmApiKey";

    beforeAll(() => {
        mockedClient = jest.spyOn(weaviate, 'client');
        mockedClient.mockReturnValue({} as WeaviateClient);
    });

    test("should default to http scheme if not specified in url", () => {
        const url = "localhost:8080";

        createWeaviateClient(url, palmApiKey);

        expect(mockedClient).toHaveBeenCalledWith(
            expect.objectContaining({
                scheme: 'http',
            })
        );

    });

    test("should follow the scheme in the URL if provided", () => {
        const url = "https://demo-breadboard-61k1eala.weaviate.network";

        createWeaviateClient(url, palmApiKey);

        expect(mockedClient).toHaveBeenCalledWith(
            expect.objectContaining({
                scheme: 'https',
            })
        );
    });

    test("should use the apiKey if provided", () => {
        const url = "https://demo-breadboard-61k1eala.weaviate.network";
        const weaviateApiKey = "testApiKey";

      createWeaviateClient(url, weaviateApiKey);

        expect(mockedClient).toHaveBeenCalledWith(
            expect.objectContaining({
                apiKey: new ApiKey(weaviateApiKey)
            })
        );
    });

});
