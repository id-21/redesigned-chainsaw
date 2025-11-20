# Vendor Photoshoot Generator

A Next.js application that allows eCommerce vendors to create professional product photoshoots from their apparel photos using AI-powered image generation (Google Gemini API).

## Features

- 🎨 **AI-Powered Image Generation** - Generate professional photoshoots using Google's Gemini API
- 🔧 **Extensible Architecture** - Easily add new photoshoot features without modifying core code
- 📦 **Multiple Photoshoot Styles**:
  - Studio photoshoots with professional lighting
  - Lifestyle scenes showing products in real-world contexts
  - Feature highlights for product details
- 💾 **Supabase Integration** - Organized data storage for vendors, products, and photoshoots
- 🎯 **Type-Safe** - Full TypeScript implementation
- 🚀 **Production Ready** - Scalable class-based architecture

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Database**: Supabase
- **Image Upload**: Client-side with drag-and-drop

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Google Cloud account with Gemini API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd redesigned-chainsaw
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Then edit `.env` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema Discussion

**⚠️ Important: Database schema needs to be finalized before implementation**

The application requires a Supabase database with the following core entities:

### Proposed Schema Overview

```
vendors → products → photoshoots → photoshoot_features
```

### Key Considerations for Discussion

1. **Vendor Management**
   - How should vendor authentication work?
   - What vendor metadata is needed? (company name, billing info, etc.)
   - Should we support teams/multiple users per vendor?

2. **Product Data**
   - What product attributes are essential? (name, category, SKU, price, etc.)
   - How should we handle product variants (sizes, colors)?
   - Should we version products?

3. **Photoshoot Storage**
   - Where should generated images be stored? (Supabase Storage, S3, CDN?)
   - How should we handle image URLs and versioning?
   - What metadata should be tracked? (generation parameters, costs, etc.)

4. **Feature Extensibility**
   - The current design uses JSONB for flexible feature data
   - Is this the right approach or should features have dedicated columns?
   - How should we handle feature-specific configuration?

5. **Additional Tables**
   - Do we need a usage/billing table?
   - Should we track API costs per generation?
   - Do we need a settings/preferences table?

See `lib/supabase/schema.sql` for the draft schema with inline comments.

## Architecture

The application uses an extensible class-based architecture. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

### Key Architectural Highlights

- **PhotoshootGenerator Pattern**: Abstract base class for creating new photoshoot features
- **Feature Registry**: Dynamic registration of feature generators
- **Type Safety**: Full TypeScript coverage with strict types
- **Separation of Concerns**: Clear boundaries between UI, API, and data layers

### Adding a New Feature

```typescript
// 1. Create a new feature generator
export class MyFeatureGenerator extends PhotoshootFeatureGenerator {
  featureType = 'my_feature'

  async generate(photoshoot, product, config) {
    // Your logic here
  }

  getPrompt(product, config) {
    return 'Your prompt'
  }
}

// 2. Register it
photoshootGenerator.registerFeature(new MyFeatureGenerator())

// 3. Use it - no other code changes needed!
```

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── generator/            # Photoshoot generator page
│   └── dashboard/            # Vendor dashboard
├── components/               # React components
├── lib/                      # Core business logic
│   ├── classes/              # Feature generator classes
│   │   └── features/         # Individual feature implementations
│   ├── gemini/               # Gemini API client
│   └── supabase/             # Supabase client and schema
├── types/                    # TypeScript type definitions
└── ARCHITECTURE.md           # Detailed architecture docs
```

## Development Roadmap

- [x] Core Next.js setup
- [x] Extensible class architecture
- [x] Gemini API integration
- [x] Basic UI components
- [ ] Finalize database schema (pending discussion)
- [ ] Implement Supabase data layer
- [ ] Add authentication
- [ ] Image storage implementation
- [ ] Background job processing
- [ ] Payment integration
- [ ] Analytics and monitoring

## Contributing

This is a custom project. For questions about the architecture or to propose database schema changes, please open an issue.

## License

ISC
