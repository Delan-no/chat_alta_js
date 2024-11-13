import fetch from 'node-fetch'; // Importation de fetch
import * as cheerio from 'cheerio'; // Importation de cheerio
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";


// Liste des URLs à charger
const urls = [
  "https://alta-voce.tech/alta-vibe-pro",
  "https://alta-voce.tech/",
  "https://alta-voce.tech/alta-call",
  "https://alta-voce.tech/faq",
  "https://alta-voce.tech/comite-scientifique",
];

// Classe pour charger des pages web
class WebBaseLoader {
  constructor(urls) {
    this.urls = urls;
  }

  async load() {
    try {
      // Récupération des réponses des URLs
      const responses = await Promise.all(this.urls.map(url => fetch(url)));
      // Vérification des réponses et extraction du texte
      const texts = await Promise.all(responses.map(async (response) => {
        if (!response.ok) {
          throw new Error(`Erreur lors du chargement de ${response.url}: ${response.statusText}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html); // Charger le HTML avec cheerio
        return $('body').text(); // Extraire le texte du body
      }));

      // Retourne le contenu et les métadonnées
      return texts.map((content, index) => ({
        pageContent: content.trim(), // Suppression des espaces inutiles
        metadata: { url: this.urls[index] }
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des documents :", error);
      throw error; // Propagation de l'erreur après journalisation
    }
  }
}

// Utilisation de WebBaseLoader
const loader = new WebBaseLoader(urls);



const model = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
});



(async () => {
  try {
    const docs = await loader.load(); // Chargement des documents
    docs.forEach(doc => {
      console.log(`Contenu de ${doc.metadata.url} :\n`, doc.pageContent); // Affichage du contenu de chaque document avec l'URL
    });
} catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
}
})();
const documentRes = await model.embedDocuments(["Hello world", "Bye bye"]);
/* Embed documents */
console.log({ documentRes });