# Product Image Analysis Instructions

Analyze the provided product image and extract the following information. Return your analysis as a JSON object.

## Required Fields:

### 1. **name** (string)
Generate a descriptive, searchable product name that includes:
- Product type
- Key visual characteristics (color, style, or pattern)
- Distinguishing features if visible

Examples:
- "Classic Blue Denim Jacket"
- "Floral Print Summer Dress"
- "Minimalist White Sneakers"
- "Vintage Leather Messenger Bag"

### 2. **description** (string)
Write a 2-3 sentence product description that:
- Describes the product's appearance and style
- Highlights key features or design elements
- Appeals to potential buyers

### 3. **target_demographic** (string)
Identify the target age demographic based on style, design, and product type:
- "Kids (0-12)"
- "Teens (13-17)"
- "Young Adults (18-30)"
- "Adults (30-50)"
- "Mature Adults (50+)"
- "All Ages"

### 4. **material** (string)
Identify the primary material(s) visible in the image:
- For fabric: "Cotton", "Denim", "Polyester", "Silk", "Wool", "Linen", "Leather", etc.
- For other products: "Wood", "Metal", "Plastic", "Glass", "Ceramic", etc.
- If uncertain: Use general terms like "Fabric", "Textile", "Mixed Materials"

### 5. **color** (string)
Identify the primary/dominant color(s):
- Use specific color names when clear (e.g., "Navy Blue", "Forest Green", "Burgundy")
- For multiple colors: List primary color first (e.g., "Blue and White Striped", "Multicolor")
- For patterns: Mention pattern and colors (e.g., "Black and White Checkered")

### 6. **tags** (array of strings)
Generate 5-8 relevant tags for categorization and search:
- Include product category (e.g., "dress", "jacket", "shoes")
- Include style descriptors (e.g., "casual", "formal", "vintage", "modern")
- Include season if applicable (e.g., "summer", "winter")
- Include use cases (e.g., "workwear", "sportswear", "evening")
- Include patterns/features (e.g., "floral", "striped", "button-down")

## Important Notes:
- Base your analysis ONLY on what you can see in the image
- If you cannot determine a field with confidence, make an educated guess based on visual cues
- Provide clear, descriptive information that will help users understand the product
