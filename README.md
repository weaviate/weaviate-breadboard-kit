# A Breadboard Kit for Weaviate

This is a kit to use weaviate with [breadboard](https://github.com/breadboard-ai/breadboard/).

This kit is a an early prototype, and is very likely to change.

# Installation

Run the following command to install the kit:

```bash
npm install weaviate-breadboard-kit
```
# Usage

## Prerequisites

You will need a running instance of weaviate. You can run it locally using [docker](https://weaviate.io/developers/weaviate/installation/docker-compose), [embedded](https://weaviate.io/developers/weaviate/installation/embedded) or use a managed instance from [Weaviate Cloud Services (WCS)](https://weaviate.io/developers/weaviate/installation/weaviate-cloud-services).

The instance needs to already contain the schema of the data you want to index. See [schema.json](./tests/schema.json) for an example of a schema and the [official docs](https://weaviate.io/developers/weaviate/tutorials/schema) for more information.

 
## Indexing

The objects you wish to index need to be in a JSON file. The file should contain an array of objects, where each object is a document to be indexed. The objects should have the same structure as the schema you have defined in weaviate.

See [data.json](./tests/data.json) for an example of a data file based on the schema in [schema.json](./tests/schema.json).

Here is an example of how to index data into weaviate:

```typescript
const inputs = {
  dataFile: "/path/to/your/data.json",
  weaviateHost: "your-weaviate-host:port",
  weaviateApiKey: "your-weaviate-api-key", # if enabled
  palmApiKey: process.env.YOUR_PALM_APIKEY,
  className: "YourClassName",
};

const board = new Board();
const kit = board.addKit(WeaviateKit);

kit
  .index()
  .wire("dataFile<-", board.input())
  .wire("weaviateHost<-", board.input())
  .wire("weaviateApiKey<-", board.input())
  .wire("PALM_KEY<-palmApiKey", board.input())
  .wire("className<-", board.input())
  .wire("->totalIndexedDocuments", board.output());
const results = await board.runOnce(inputs);

// this will print the total number of documents indexed
console.log("result", results);
```

## Querying

You can use weaviate's [hybrid query](https://weaviate.io/developers/weaviate/search/hybrid) to query the indexed objects.

For example, using the sample data in [data.json](./tests/data.json):

```typescript
const inputs = {
  weaviateHost: "your-weaviate-host:port",
  palmApiKey: process.env.YOUR_PALM_APIKEY,
  query: "a book about a sorcerer",
  alpha: 1,
  className: "Book",
  fields: "title summary"
};

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

// prints the title and summary of the books with harry potter
// as the first result
console.log(results);
```

You can also pass graphql queries directly to weaviate. This is useful if you want to customise the query beyond what the kit's hybrid query interface allows. For example:

```typescript
const inputs = {
  weaviateHost: "your-weaviate-host:port",
  palmApiKey: process.env.YOUR_PALM_APIKEY,
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

const board = new Board();
const kit = board.addKit(WeaviateKit);

kit
  .query()
  .wire("weaviateHost<-", board.input())
  .wire("PALM_KEY<-palmApiKey", board.input())
  .wire("rawQuery<-", board.input())
  .wire("->searchResults", board.output());

// prints only 1 result with the title and summary of the book
const results = await board.runOnce(inputs);

```

# Contributing

You can use the provided devcontainer to create a local environment to develop, build, test and run the kit.

Simply update the relevant credentials in [`devcontainer.json`](.devcontainer/devcontainer.json) e.g. PaLM API key, and then rebuild the devcontainer.

# Making a new release

Run the following command to create a new release:

```bash
# Create a new branch
git checkout -b version-bump

# Bump the version
npm version patch -m "Upgrade to %s for reasons"

# Push the branch
git push origin version-bump

# Create a PR to merge the branch into main

# After PR is merged into main, checkout main and pull latest changes
git checkout main
git pull origin main

# Now push the tags, which will trigger the release workflow
git push origin --tags
```