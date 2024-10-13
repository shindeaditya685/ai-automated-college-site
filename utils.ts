/* eslint-disable @typescript-eslint/no-explicit-any */
// /utils.ts

import { HfInference } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

export async function queryPineconeVectorStore(
  client: Pinecone,
  indexName: string,
  namespace: string,
  query: string
): Promise<string> {
  const apiOutput = await hf.featureExtraction({
    model: "mixedbread-ai/mxbai-embed-large-v1",
    inputs: query,
  });

  const queryEmbedding = Array.from(apiOutput);
  const index = client.Index(indexName);
  const queryResponse = await index.namespace(namespace).query({
    topK: 5,
    vector: queryEmbedding as any,
    includeMetadata: true,
    includeValues: false,
  });

  console.log(queryResponse);

  if (queryResponse.matches.length > 0) {
    const concatenatedRetrievals = queryResponse.matches
      .map(
        (match, index) =>
          `\nCollege Information ${index + 1}: \n ${match.metadata?.chunk}`
      )
      .join(". \n\n");
    return concatenatedRetrievals;
  } else {
    return "<no relevant information found>";
  }
}
