import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

async function main() {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://interstisopenaiformation.openai.azure.com/";
  const apiKey = "6ea9703016b54b9686e3a744defdd5c3";
  const apiVersion = "2024-05-01-preview";
  const deployment = "alta-bot"; // This must match your deployment name

  const llm = new AzureChatOpenAI({
    azureOpenAIApiKey: apiKey,
    azureOpenAIApiInstanceName: "interstisopenaiformation",
    azureOpenAIApiDeploymentName: deployment,
    azureOpenAIApiVersion: apiVersion,
  });

  console.log(llm);
  const result = await llm.invoke([
    ["system", "You are an AI assistant that helps people find information."],
    ["human", "What is programming?"],
  ]);

  console.log(result);
}

main();
