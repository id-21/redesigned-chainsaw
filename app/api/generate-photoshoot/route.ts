import { NextRequest, NextResponse } from 'next/server'
import { photoshootGenerator } from '@/lib/classes/PhotoshootGenerator'
import { initializeFeatureGenerators } from '@/lib/init-features'
import { createGeminiClient } from '@/lib/gemini/client'
import type { Product, Photoshoot } from '@/types'

// Initialize feature generators
initializeFeatureGenerators()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, productImage, features = [] } = body

    if (!productName || !productImage) {
      return NextResponse.json(
        { error: 'Product name and image are required' },
        { status: 400 }
      )
    }

    // Create a mock product object
    // In production, this would be saved to Supabase first
    const product: Product = {
      id: crypto.randomUUID(),
      vendorId: 'demo-vendor', // This would come from authentication
      name: productName,
      category: 'apparel',
      originalImageUrl: productImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create a photoshoot record
    const photoshoot: Photoshoot = {
      id: crypto.randomUUID(),
      productId: product.id,
      vendorId: product.vendorId,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Generate main photoshoot image
    const geminiClient = createGeminiClient()
    const mainImageUrl = await geminiClient.generateProductPhotoshoot(
      product.originalImageUrl,
      `Professional product photoshoot of ${product.name}`,
      'professional'
    )

    photoshoot.generatedImageUrl = mainImageUrl
    photoshoot.status = 'completed'

    // Generate additional features if requested
    const generatedFeatures = await photoshootGenerator.generateWithFeatures(
      product,
      photoshoot,
      features
    )

    // In production, save to Supabase here
    // await savePhotoshootToDatabase(photoshoot, generatedFeatures)

    // Return generated images
    const images = [
      {
        url: mainImageUrl,
        featureType: 'main',
      },
      ...generatedFeatures.map((feature) => ({
        url: feature.generatedImageUrl,
        featureType: feature.featureType,
      })),
    ]

    return NextResponse.json({
      success: true,
      photoshootId: photoshoot.id,
      images,
    })
  } catch (error) {
    console.error('Error generating photoshoot:', error)
    return NextResponse.json(
      { error: 'Failed to generate photoshoot' },
      { status: 500 }
    )
  }
}
