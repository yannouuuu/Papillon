import detection_json from "@/utils/magic/regex/evaldetection.json";

type DetectionJson = {
  [key: string]: string[];
};

const detectionData: DetectionJson = detection_json;

function normalizeString (input: string): string {
  return input.toLowerCase().replace(/[\s-]+/g, "");
}

function detectCategory (input: string): string | null {
  const normalizedInput = normalizeString(input);

  for (const category in detectionData) {
    for (const pattern of detectionData[category]) {
      const regex = new RegExp(pattern, "i");
      const match = input.match(regex);

      if (match) {
        console.log(`Texte d'entrée : "${input}"`);
        console.log(`Catégorie détectée : ${category}`);
        console.log(`Pattern détecté : ${pattern}`);
        console.log(`Texte correspondant : ${match[0]}`);
        return category;
      }
    }
  }

  return null;
}

export default detectCategory;