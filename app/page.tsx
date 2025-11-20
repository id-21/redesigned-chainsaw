import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6">
          Vendor Photoshoot Generator
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Transform your apparel photos into professional product photoshoots using AI
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/generator"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
