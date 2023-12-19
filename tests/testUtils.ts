import fs from 'fs/promises';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from "testcontainers";


/**
 * `WeaviateTestManager` is a utility class designed to manage a test instance of Weaviate for integration tests.
 * Weaviate is a cloud-native, modular, real-time vector search engine built to scale your machine learning models.
 */
export class WeaviateTestManager {
    public client: WeaviateClient;
    public environment: StartedDockerComposeEnvironment;
    public host: string;
    private scheme: string;

    /**
     * Initializes a Weaviate client with the provided scheme and host.
     */
    public async createClient() {
        this.client = weaviate.client({
            scheme: this.scheme,
            host: this.host,
            headers: { "X-Palm-Api-Key": process.env.PALM_APIKEY }
        });
    }

    /**
     * Creates a schema in the Weaviate instance. The schema is defined in a JSON file whose path is provided as an argument.
     * @param {string} schemaFile - The path to the schema file. Defaults to "./tests/schema.json".
     */
    public async createSchema(schemaFile: string = "./tests/schema.json") {
        const schema = JSON.parse(await fs.readFile(schemaFile, "utf-8"));
        return await this.client.schema.classCreator().withClass(schema).do();
    }

    /**
     * Imports data into the Weaviate instance. The data is defined in a JSON file whose path is provided as an argument.
     * The data is imported into the class specified by the `className` argument.
     * @param {string} dataFile - The path to the data file. Defaults to "./tests/data.json".
     * @param {string} className - The name of the class to import the data into. Defaults to "Book".
     */
    public async importData(dataFile: string = "./tests/data.json", className: string = "Book") {
        const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
        const batcher = this.client.batch.objectsBatcher()

        for (const d of data) {
            batcher.withObject({
                class: className,
                properties: d
            });
        }

        return await batcher.do();
    }

    /**
     * Deploys a Weaviate instance using Docker Compose. The Docker Compose file is located at the path specified by the `composeFilePath` and `composeFile` arguments.
     * After the Weaviate instance is deployed, this method initializes the Weaviate client and creates the schema.
     * @param {string} composeFilePath - The path to the directory containing the Docker Compose file. Defaults to "tests".
     * @param {string} composeFile - The name of the Docker Compose file. Defaults to "docker-compose.yml".
     */
    public async deployWeaviate(composeFilePath: string = "tests", composeFile: string = "docker-compose.yml") {
        this.environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
            .withWaitStrategy("weaviate", Wait.forHttp("/v1/.well-known/ready", 8080))
            .up();

        const weaviateContainer = this.environment.getContainer("weaviate_1");
        const host = weaviateContainer.getHost();
        const port = weaviateContainer.getMappedPort(8080);

        this.host = `${host}:${port}`;
        this.scheme = "http";
        this.createClient();
        await this.createSchema();
    }
}