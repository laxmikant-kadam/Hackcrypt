import type { NextApiRequest, NextApiResponse } from 'next'

type ChatRequest = {
  message: string
  language: string
  type: string
}

type ChatResponse = {
  response: string
  timestamp: string
  language: string
}

type ErrorResponse = {
  error: string
  details?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, language, type } = req.body as ChatRequest

    if (!message) {
      return res.status(400).json({ error: 'No message provided' })
    }

    // Get Flask backend URL from environment variable or use default
    const backendUrl = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

    // Forward the request to Flask backend
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, language, type }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({
        error: 'Backend error',
        details: errorData.error || 'Unknown error'
      })
    }

    const data = await response.json()
    return res.status(200).json(data)

  } catch (error) {
    console.error('API route error:', error)

    // For development: simulate response if backend is not available
    if (process.env.NODE_ENV === 'development') {
      const languageMap: Record<string, string> = {
        'en': 'English',
        'hi': 'Hindi',
        'mr': 'Marathi'
      }

      const language = (req.body as ChatRequest)?.language || 'en'
      const message = (req.body as ChatRequest)?.message || ''
      const languageName = languageMap[language] || language

      return res.status(200).json({
        response: `Development mode: I received your message in ${languageName}: "${message}". The Flask backend is not connected.`,
        timestamp: new Date().toISOString(),
        language: language
      })
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}