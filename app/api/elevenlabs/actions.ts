"use server"

export async function generateSpeech(text: string, voiceId = "pNInz6obpgDQGcFmaJgB") {
  try {
    const API_KEY = process.env.ELEVENLABS_API_KEY

    if (!API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not defined")
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to generate speech: ${errorText}`)
    }

    // Get the audio data as an ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer()

    // Convert ArrayBuffer to Base64
    const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64")

    // Return the audio data as base64
    return {
      success: true,
      audioBase64,
      error: null,
    }
  } catch (error) {
    console.error("Error generating speech:", error)
    return {
      success: false,
      audioBase64: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getVoices() {
  try {
    const API_KEY = process.env.ELEVENLABS_API_KEY

    if (!API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not defined")
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        Accept: "application/json",
        "xi-api-key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch voices")
    }

    const data = await response.json()
    return {
      success: true,
      voices: data.voices,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching voices:", error)
    return {
      success: false,
      voices: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
