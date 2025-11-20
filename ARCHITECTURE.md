# Architecture Documentation

## Overview

This Next.js application provides an AI-powered photoshoot generation platform for eCommerce vendors selling apparel. The system uses Google's Gemini API for image generation and Supabase for data persistence.

## Core Architecture Principles

### 1. Extensible Class-Based Design

The application is built around an extensible class architecture that allows features to be easily added without modifying core code.

#### PhotoshootGenerator Pattern

```typescript
// Base class for all feature generators
abstract class PhotoshootFeatureGenerator {
  abstract featureType: string
  abstract generate(photoshoot, product, config): Promise<PhotoshootFeature>
  abstract getPrompt(product, config): string
  validate(config): boolean
}
```

This pattern enables:
- **Easy feature addition**: Create a new class extending `PhotoshootFeatureGenerator`
- **Decoupled logic**: Each feature is independent and self-contained
- **Configuration flexibility**: Each feature can have its own config schema
- **Type safety**: TypeScript ensures proper implementation

### 2. Feature Generator Examples

Three feature generators are included as examples:

1. **StudioPhotoshootGenerator** - Professional studio photography with clean backgrounds
2. **LifestylePhotoshootGenerator** - Product in real-world contexts
3. **FeatureHighlightGenerator** - Close-up detail shots

To add a new feature:

```typescript
// lib/classes/features/CustomFeatureGenerator.ts
export class CustomFeatureGenerator extends PhotoshootFeatureGenerator {
  featureType = 'custom_feature'

  async generate(photoshoot, product, config) {
    // Your generation logic
  }

  getPrompt(product, config) {
    // Your prompt construction
  }
}

// Register in lib/init-features.ts
photoshootGenerator.registerFeature(new CustomFeatureGenerator())
```

### 3. Data Structure Design

#### Core Entities

```typescript
Vendor → Products → Photoshoots → PhotoshootFeatures
```

- **Vendor**: eCommerce business account
- **Product**: Individual apparel item with original image
- **Photoshoot**: Main generated photoshoot for a product
- **PhotoshootFeature**: Additional generated images (lifestyle, features, etc.)

This hierarchical structure allows:
- Easy querying (all products for a vendor, all photoshoots for a product)
- Data isolation between vendors
- Flexible metadata storage (JSONB fields)
- Feature extensibility without schema changes

### 4. API Integration Layer

#### Gemini Client (`lib/gemini/client.ts`)

Handles all interactions with Google's Gemini API:
- Image generation from text prompts
- Product photoshoot creation
- Feature highlight generation
- Configurable generation parameters

#### Supabase Client (`lib/supabase/client.ts`)

Manages database connections and queries:
- Singleton pattern for connection pooling
- Environment-based configuration
- Ready for Row Level Security (RLS) implementation

### 5. Type Safety

All data structures are fully typed in `types/index.ts`:
- Entity types (Vendor, Product, Photoshoot, PhotoshootFeature)
- Request/Response types for APIs
- Configuration types for services

## Component Architecture

### Page Structure

```
app/
├── page.tsx              # Landing page
├── generator/page.tsx    # Main photoshoot generator
├── dashboard/page.tsx    # User dashboard
└── api/
    └── generate-photoshoot/route.ts  # Generation API
```

### Reusable Components

```
components/
├── ImageUpload.tsx       # Drag-and-drop image upload
├── FeatureSelector.tsx   # Feature selection checkboxes
└── PhotoshootPreview.tsx # Generated image preview
```

## Scalability Considerations

### 1. Database Design
- Indexes on foreign keys for fast joins
- JSONB for flexible metadata storage
- Timestamps for audit trails
- UUIDs for distributed systems

### 2. Feature Registry
- Dynamic feature loading
- Plugin-style architecture
- No code changes needed for new features

### 3. API Design
- Stateless API routes
- Async processing ready
- Error handling and validation

## Next Steps for Production

1. **Database Schema Implementation** (pending discussion)
2. **Authentication** - Vendor login/signup
3. **File Storage** - Supabase Storage or S3 integration
4. **Job Queue** - Background processing for long-running generations
5. **Caching** - Redis for generated images
6. **Rate Limiting** - API request throttling
7. **Monitoring** - Error tracking and analytics

## Adding New Features: Step-by-Step

1. Create new generator class in `lib/classes/features/`
2. Extend `PhotoshootFeatureGenerator`
3. Implement required methods
4. Register in `lib/init-features.ts`
5. Add to UI in `components/FeatureSelector.tsx`
6. No database changes needed (uses flexible JSONB)

This architecture prioritizes extensibility and maintainability while keeping the codebase organized and type-safe.
