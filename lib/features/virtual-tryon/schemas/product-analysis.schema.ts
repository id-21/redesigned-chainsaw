/**
 * Gemini Structured Output Schema for Product Analysis
 *
 * This schema is used with Gemini's responseSchema parameter to ensure
 * guaranteed JSON output format. Edit this file to modify the AI's output
 * structure without touching the API code.
 *
 * @see https://ai.google.dev/gemini-api/docs/structured-output
 */

export const ProductAnalysisSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "A clear, concise product name that captures the essence of the item"
    },
    description: {
      type: "string",
      description: "A compelling 2-3 sentence description highlighting key features, style, and use cases"
    },
    target_demographic: {
      type: "string",
      description: "The primary target age group and demographic (e.g., 'Young Adults (18-30)', 'Professionals (25-45)')"
    },
    material: {
      type: "string",
      description: "The primary material(s) the product appears to be made from (e.g., 'Cotton', 'Denim', 'Leather blend')"
    },
    color: {
      type: "string",
      description: "The primary color(s) of the product (e.g., 'Navy Blue', 'Black with white accents')"
    },
    tags: {
      type: "array",
      items: {
        type: "string"
      },
      description: "5-8 relevant tags for categorization and search (e.g., style, season, occasion, features)"
    }
  },
  required: ["name", "description", "target_demographic", "material", "color", "tags"]
} as const;

export type ProductAnalysisResult = {
  name: string;
  description: string;
  target_demographic: string;
  material: string;
  color: string;
  tags: string[];
};
