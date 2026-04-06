import { useCallback, useRef, useState } from 'react'

export interface VoiceGuidanceOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

// Text-to-Speech translations for common messages
const voiceMessages = {
  en: {
    'scanner-prompt': 'Paste a message or URL to analyze for potential scams',
    'scan-button': 'Click scan to check for threats',
    'high-risk': 'This appears to be a high-risk scam message',
    'low-risk': 'This message appears relatively safe',
    'lesson-complete': 'Congratulations, you have completed this lesson',
    'scam-detected': 'Warning: This message contains multiple scam indicators',
  },
  hi: {
    'scanner-prompt': 'संभावित घोटाले के लिए विश्लेषण करने के लिए एक संदेश या URL पेस्ट करें',
    'scan-button': 'खतरों की जांच करने के लिए स्कैन करें क्लिक करें',
    'high-risk': 'यह एक उच्च जोखिम वाला घोटाला संदेश प्रतीत होता है',
    'low-risk': 'यह संदेश अपेक्षाकृत सुरक्षित प्रतीत होता है',
    'lesson-complete': 'बधाई हो, आपने इस पाठ को पूरा कर लिया है',
    'scam-detected': 'चेतावनी: इस संदेश में कई घोटाले के संकेत हैं',
  },
  ml: {
    'scanner-prompt': 'സഭ്യതയ്ക്കായി ഒരു സന്ദേശം അല്ലെങ്കിൽ URL പേസ്റ്റ് ചെയ്യുക',
    'scan-button': 'ഭീഷണികൾ പരിശോധിക്കാൻ സ്കാൻ ക്ലിക്ക് ചെയ്യുക',
    'high-risk': 'ഇത് ഉയർന്ന അപായമുള്ള ഉപദ്രവ സന്ദേശമാണ്',
    'low-risk': 'ഈ സന്ദേശം താരതമ്യേന സുരക്ഷിതമാണ്',
    'lesson-complete': 'അഭിനന്ദനങ്ങൾ, നിങ്ങൾ ഈ പാഠം പൂർത്തിയാക്കിയിരിക്കുന്നു',
    'scam-detected': 'മുന്നറിപ്പ്: ഈ സന്ദേശത്തിൽ കൾപ്പ കീകൾ അനേകം ചിഹ്നങ്ങളുണ്ട്',
  },
}

export function useVoiceGuidance(options: VoiceGuidanceOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(typeof window !== 'undefined' && 'speechSynthesis' in window)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const language = options.language || 'en'
  const rate = options.rate || 0.9
  const pitch = options.pitch || 1
  const volume = options.volume || 0.7

  const speak = useCallback((messageKey: string | { [key: string]: string }, customText?: string) => {
    if (!isSupported) return

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    let text: string
    if (customText) {
      text = customText
    } else if (typeof messageKey === 'string') {
      // Get translated message or fallback to English
      const messages = voiceMessages[language as keyof typeof voiceMessages] || voiceMessages.en
      text = messages[messageKey as keyof typeof messages] || messageKey
    } else {
      text = messageKey[language] || messageKey.en || ''
    }

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Set language code
    const langCode = language === 'hi' ? 'hi-IN' : language === 'ml' ? 'ml-IN' : 'en-US'
    utterance.lang = langCode

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isSupported, language, rate, pitch, volume])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && 'pause' in window.speechSynthesis) {
      window.speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported && 'resume' in window.speechSynthesis) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
  }
}
