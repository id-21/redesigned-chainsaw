import fs from 'fs';
import path from 'path';

export type GenerationType = 'model_shot' | 'lifestyle' | 'room_scene';

/**
 * Load the system instruction that applies to all generation types
 */
export function loadSystemInstruction(): string {
  const promptsDir = path.join(process.cwd(), 'lib/features/virtual-tryon/prompts');
  const filePath = path.join(promptsDir, 'system-instruction.md');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Failed to load system instruction:', error);
    // Fallback system instruction
    return 'You are an expert product photographer creating professional e-commerce images. Generate high-quality, photorealistic images that showcase the product effectively while maintaining product authenticity.';
  }
}

/**
 * Load prompt template for a specific generation type
 */
export function getGenerationPrompt(generationType: GenerationType): string {
  const promptsDir = path.join(process.cwd(), 'lib/features/virtual-tryon/prompts');

  const fileMap: Record<GenerationType, string> = {
    'model_shot': 'model-shot.md',
    'lifestyle': 'lifestyle.md',
    'room_scene': 'room-scene.md',
  };

  const filename = fileMap[generationType];
  if (!filename) {
    return 'Generate an image featuring this product.';
  }

  const filePath = path.join(promptsDir, filename);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to load prompt template: ${filename}`, error);
    // Fallback prompts
    switch (generationType) {
      case 'model_shot':
        return 'Generate a professional model wearing or using this product in a studio setting with clean background.';
      case 'lifestyle':
        return 'Generate a lifestyle image showing this product being used in a realistic, everyday setting.';
      case 'room_scene':
        return 'Generate a beautifully styled room scene featuring this product in an interior design context.';
      default:
        return 'Generate an image featuring this product.';
    }
  }
}

/**
 * Build the complete user prompt with template and optional custom instructions
 */
export function buildGenerationPrompt(
  generationType: GenerationType,
  customInstructions?: string
): string {
  const basePrompt = getGenerationPrompt(generationType);

  if (customInstructions && customInstructions.trim()) {
    return `${basePrompt}\n\n## Additional Custom Requirements:\n${customInstructions}`;
  }

  return basePrompt;
}
