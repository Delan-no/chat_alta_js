import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const OPENAI_API_KEY = "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";

const urls = [
  "https://alta-voce.tech/alta-vibe-pro",
  "https://alta-voce.tech/",
  "https://alta-voce.tech/alta-call",
  "https://alta-voce.tech/faq",
  "https://alta-voce.tech/comite-scientifique",
];

// Charge les pages web
const loadPages = async () => {
  const results = [];
  for (const url of urls) {
    const loader = new CheerioWebBaseLoader(url);
    const response = await loader.load();
    results.push(response);
  }
  return results;
};

// Divise le texte des pages en morceaux plus petits
const splitText = async (docs) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    separators: ["\n", "\n\n", "", " "],
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  let splits = [];
  for (const doc of docs) {
    const splited_docs = await textSplitter.splitDocuments(doc);
    splits = [...splits, ...splited_docs]; // Applatir le tableau
  }

  return splits;
};

const main = async () => {
  const docs = await loadPages();
  const splits = await splitText(docs);

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings({ apiKey: OPENAI_API_KEY })
  );

  const retriever = vectorStore.asRetriever();
  // console.log(retriever);

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: OPENAI_API_KEY,
  });

  const systemPrompt =
    "Tu es un assistant de question- réponse " +
    "Répond à toutes les questions en te basant sur le context fournit." +
    " tu dois fournir les informations que tu rencontres sur le site exactement et tu donnes les vrais résultats" +
    "quand tu rencontres un message et tu vois que tu ne peux pas produire une reponse avec  le contexte qui t'es fourni, tu demandes à l'utilisateur ses informations pour qu'un conseiller puisse rentrer en contact avec lui" +
    "\n\n" +
    "{context}";

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"],
  ]);

  const questionAnswerChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const ragChain = await createRetrievalChain({
    retriever,
    combineDocsChain: questionAnswerChain,
  });
  const response = await ragChain.invoke({
    input: "Puis-je tester Alta Call ?",
  });
  console.log(response.answer);
};

main();
