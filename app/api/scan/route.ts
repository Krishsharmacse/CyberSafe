import { NextResponse } from 'next/server'
import { analyzeUrl } from '@/lib/scam-detector'

// Enable CORS for the Chrome Extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid payload. Expected an array of URLs.' }, { status: 400, headers: corsHeaders })
    }

    // Process all URLs through the scam detector
    const results = urls.map((url) => {
      try {
        const analysis = analyzeUrl(url)
        // A risk score >= 20 is considered suspicious for this extension's threshold
        const isSuspicious = analysis.riskScore >= 20
        return {
          url,
          isSuspicious,
          score: analysis.riskScore,
          patterns: analysis.patterns.map(p => p.name)
        }
      } catch (e) {
        // If the URL is incredibly malformed, ignore it
        return { url, isSuspicious: false, score: 0, patterns: [] }
      }
    })

    return NextResponse.json({ results }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders })
  }
}
