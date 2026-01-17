"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Send,
  Globe,
  ArrowLeft,
  MessageSquare,
  Volume2,
  VolumeX,
  Sparkles,
  WifiOff,
  Loader2,
} from "lucide-react"

interface ChatbotContentProps {
  type: "multilingual" | "generalized" | "knowledge"
  onBack: () => void
}

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: string
  language?: string
}

const ChatbotContent: React.FC<ChatbotContentProps> = ({ type = "multilingual", onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const [availableLanguages] = useState([
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "mr", name: "Marathi" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [transcriptBuffer, setTranscriptBuffer] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const [voiceActivity, setVoiceActivity] = useState(0)
  const voiceActivityInterval = useRef<NodeJS.Timeout | null>(null)
  const [isRecognitionActive, setIsRecognitionActive] = useState(false)

  // Add welcome message based on chatbot type
  useEffect(() => {
    let welcomeMessage = ""

    switch (type) {
      case "multilingual":
        welcomeMessage =
          "Welcome to the Multilingual Voice Chatbot! I can understand and respond in Hindi, Marathi, and English. Try speaking or typing your question."
        break
      case "generalized":
        welcomeMessage =
          "Welcome to the Generalized Voice Chatbot! I'm here to help with any questions. Just speak naturally or type your query."
        break
      case "knowledge":
        welcomeMessage =
          "Welcome to the Knowledge Voice Graph! I can find relationships between concepts. Speak your query or type to begin."
        break
      default:
        welcomeMessage = "Welcome! How can I assist you today? Try using your voice for a more natural experience."
    }

    setMessages([
      {
        id: Date.now(),
        text: welcomeMessage,
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ])

    // Request microphone permission on component mount
    checkMicrophonePermission()
  }, [type])

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicPermission(true)
        // Stop the stream immediately after permission check
        stream.getTracks().forEach((track) => track.stop())
      } else {
        setMicPermission(false)
      }
    } catch (error) {
      console.error("Microphone permission error:", error)
      setMicPermission(false)
    }
  }

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize and configure speech recognition
  useEffect(() => {
    // Clean up previous recognition instance
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    // Initialize speech recognition with proper error handling
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      // Configure recognition
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = selectedLanguage
      recognitionRef.current.maxAlternatives = 1

      // Handle recognition results
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscriptUpdate = finalTranscript

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTranscriptUpdate += transcript + " "
            setFinalTranscript(finalTranscriptUpdate)
            setInputMessage(finalTranscriptUpdate)
          } else {
            interimTranscript += transcript
            setTranscriptBuffer(interimTranscript)
            setInputMessage(finalTranscriptUpdate + interimTranscript)
          }
        }

        // Update voice activity visualization
        simulateVoiceActivity()
      }

      // Handle recognition errors
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)

        if (event.error === "no-speech") {
          console.log("No speech detected. Restarting recognition...")
          if (isListening) {
            restartRecognition()
          }
        } else if (event.error === "audio-capture") {
          console.error("Audio capture failed. Microphone may be disconnected.")
          setMicPermission(false)
          setIsListening(false)
        } else if (event.error === "not-allowed") {
          console.error("Microphone permission denied.")
          setMicPermission(false)
          setIsListening(false)
        } else {
          setIsListening(false)
          setIsRecognitionActive(false)
        }
      }

      // Handle recognition end
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended")
        setIsRecognitionActive(false)

        // Restart if still in listening mode
        if (isListening) {
          console.log("Restarting recognition because still in listening mode")
          restartRecognition()
        }
      }

      // Handle recognition start
      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started")
        setIsRecognitionActive(true)
      }
    } else {
      console.error("Speech recognition not supported in this browser")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (voiceActivityInterval.current) {
        clearInterval(voiceActivityInterval.current)
      }
    }
  }, [selectedLanguage])

  // Restart recognition with a small delay to prevent rapid restarts
  const restartRecognition = () => {
    setTimeout(() => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error("Error restarting recognition:", error)
        }
      }
    }, 300)
  }

  const simulateVoiceActivity = () => {
    if (voiceActivityInterval.current) {
      clearInterval(voiceActivityInterval.current)
    }

    setVoiceActivity(Math.random() * 80 + 20)

    voiceActivityInterval.current = setInterval(() => {
      setVoiceActivity((prev) => {
        const newValue = Math.random() * 80 + 20
        return isListening ? newValue : 0
      })
    }, 150)
  }

  const toggleListening = async () => {
    if (!micPermission) {
      await checkMicrophonePermission()
      return
    }

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) return

    try {
      // Reset transcripts when starting new listening session
      setFinalTranscript("")
      setTranscriptBuffer("")

      recognitionRef.current.start()
      setIsListening(true)
      simulateVoiceActivity()
      console.log("Started listening")
    } catch (error) {
      console.error("Error starting speech recognition:", error)

      // If already started, stop and restart
      if (error instanceof DOMException && error.name === "InvalidStateError") {
        recognitionRef.current.stop()
        setTimeout(() => {
          recognitionRef.current.start()
          setIsListening(true)
          simulateVoiceActivity()
        }, 100)
      }
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
      setVoiceActivity(0)

      if (voiceActivityInterval.current) {
        clearInterval(voiceActivityInterval.current)
      }

      console.log("Stopped listening")
    } catch (error) {
      console.error("Error stopping speech recognition:", error)
    }
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    if (isSpeaking && !audioEnabled) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    // Stop listening if active
    if (isListening) {
      stopListening()
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setFinalTranscript("")
    setTranscriptBuffer("")
    setIsLoading(true)

    try {
      // Call Flask backend API
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          language: selectedLanguage,
          type,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()

      const botResponse = {
        id: Date.now() + 1,
        text: data.response,
        sender: "bot",
        timestamp: new Date().toISOString(),
        language: data.language || selectedLanguage,
      }

      setMessages((prev) => [...prev, botResponse])

      // Text-to-speech for bot response
      if (audioEnabled) {
        speakResponse(data.response, data.language || selectedLanguage)
      }
    } catch (error) {
      console.error("Failed to send message:", error)

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request. Please check if the Flask backend is running.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const speakResponse = (text: string, language: string) => {
    if (!("speechSynthesis" in window)) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = language
    speech.volume = 1.0
    speech.rate = 1.0
    speech.pitch = 1.0

    speech.onstart = () => setIsSpeaking(true)
    speech.onend = () => setIsSpeaking(false)
    speech.onerror = (event) => {
      console.error("Speech synthesis error:", event)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(speech)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Get color scheme based on chatbot type
  const getTheme = () => {
    switch (type) {
      case "multilingual":
        return {
          primary: "purple",
          gradient: "from-purple-900/40 via-indigo-900/40 to-violet-900/40",
          glow: "0 0 40px rgba(147,51,234,0.3)",
          icon: <Globe className="w-6 h-6 text-purple-400" />,
        }
      case "generalized":
        return {
          primary: "emerald",
          gradient: "from-emerald-900/40 via-green-900/40 to-teal-900/40",
          glow: "0 0 40px rgba(16,185,129,0.3)",
          icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
        }
      case "knowledge":
        return {
          primary: "amber",
          gradient: "from-amber-900/40 via-yellow-900/40 to-orange-900/40",
          glow: "0 0 40px rgba(217,119,6,0.3)",
          icon: <Sparkles className="w-6 h-6 text-amber-400" />,
        }
      default:
        return {
          primary: "cyan",
          gradient: "from-cyan-900/40 via-blue-900/40 to-sky-900/40",
          glow: "0 0 40px rgba(6,182,212,0.3)",
          icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
        }
    }
  }

  const theme = getTheme()

  const getColorClass = (element: string) => {
    const classes = {
      purple: {
        bg: "bg-purple-500/10",
        bgActive: "bg-purple-500/30",
        bgHover: "hover:bg-purple-500/20",
        border: "border-purple-500/30",
        borderActive: "border-purple-500/70",
        text: "text-purple-400",
        textActive: "text-purple-300",
        glow: "shadow-[0_0_20px_rgba(147,51,234,0.3)]",
        glowStrong: "shadow-[0_0_30px_rgba(147,51,234,0.4)]",
        gradient: "bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20",
        gradientBright: "bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-violet-500/40",
        ring: "ring-purple-500/50",
      },
      emerald: {
        bg: "bg-emerald-500/10",
        bgActive: "bg-emerald-500/30",
        bgHover: "hover:bg-emerald-500/20",
        border: "border-emerald-500/30",
        borderActive: "border-emerald-500/70",
        text: "text-emerald-400",
        textActive: "text-emerald-300",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        glowStrong: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
        gradient: "bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20",
        gradientBright: "bg-gradient-to-r from-emerald-500/40 via-green-500/40 to-teal-500/40",
        ring: "ring-emerald-500/50",
      },
      amber: {
        bg: "bg-amber-500/10",
        bgActive: "bg-amber-500/30",
        bgHover: "hover:bg-amber-500/20",
        border: "border-amber-500/30",
        borderActive: "border-amber-500/70",
        text: "text-amber-400",
        textActive: "text-amber-300",
        glow: "shadow-[0_0_20px_rgba(217,119,6,0.3)]",
        glowStrong: "shadow-[0_0_30px_rgba(217,119,6,0.4)]",
        gradient: "bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20",
        gradientBright: "bg-gradient-to-r from-amber-500/40 via-yellow-500/40 to-orange-500/40",
        ring: "ring-amber-500/50",
      },
      cyan: {
        bg: "bg-cyan-500/10",
        bgActive: "bg-cyan-500/30",
        bgHover: "hover:bg-cyan-500/20",
        border: "border-cyan-500/30",
        borderActive: "border-cyan-500/70",
        text: "text-cyan-400",
        textActive: "text-cyan-300",
        glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
        glowStrong: "shadow-[0_0_30px_rgba(6,182,212,0.4)]",
        gradient: "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-sky-500/20",
        gradientBright: "bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-sky-500/40",
        ring: "ring-cyan-500/50",
      },
    }

    return classes[theme.primary as keyof typeof classes][element as keyof (typeof classes)[keyof typeof classes]]
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col p-4 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15)_0,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Voice wave background effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
          <div className="relative h-full">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute bottom-0 left-1/2 rounded-t-full ${getColorClass("bg")} transform -translate-x-1/2`}
                style={{
                  left: `${5 + i * 8}%`,
                  width: "4px",
                  height: `${isListening ? (Math.random() * 40) + 5 : 5}%`,
                  opacity: isListening ? 0.7 : 0.3,
                  transition: "height 0.2s ease-in-out",
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating particles */}
        <div
          className="absolute w-4 h-4 rounded-full bg-blue-500/10 blur-sm top-1/4 left-1/4 animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute w-6 h-6 rounded-full bg-purple-500/10 blur-sm top-3/4 left-1/3 animate-pulse"
          style={{ animationDuration: "7s" }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-cyan-500/10 blur-sm top-1/2 right-1/4 animate-pulse"
          style={{ animationDuration: "5s" }}
        />
      </div>

      <header className="flex justify-between items-center mb-6 relative z-10">
        <button
          onClick={onBack}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${getColorClass("bg")} ${getColorClass("border")} ${getColorClass("bgHover")}`}
        >
          <ArrowLeft className={`w-5 h-5 ${getColorClass("text")}`} />
          <span className={`font-mono ${getColorClass("text")}`}>Back</span>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${theme.primary === "purple" ? "rgba(147,51,234,0.2)" : theme.primary === "emerald" ? "rgba(16,185,129,0.2)" : theme.primary === "amber" ? "rgba(217,119,6,0.2)" : "rgba(6,182,212,0.2)"} 0%, transparent 70%)`,
            }}
          ></div>
        </button>

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getColorClass("gradient")}`}>{theme.icon}</div>
          <h2 className={`text-xl font-bold font-mono ${getColorClass("text")}`}>
            {type === "multilingual"
              ? "Voice Multilingual"
              : type === "generalized"
                ? "Voice Assistant"
                : "Voice Knowledge Hub"}
          </h2>
        </div>

        <div className="relative flex gap-2">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full transition-all duration-300 ${getColorClass("bg")} ${getColorClass("border")} ${getColorClass("bgHover")}`}
            aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
          >
            {audioEnabled ? (
              <Volume2 className={`w-5 h-5 ${getColorClass("text")}`} />
            ) : (
              <VolumeX className={`w-5 h-5 ${getColorClass("text")}`} />
            )}
          </button>

          <div
            className={`language-selector flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${getColorClass("bg")} ${getColorClass("border")} ${getColorClass("bgHover")}`}
          >
            <Globe className={`w-4 h-4 ${getColorClass("text")}`} />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent border-none text-gray-300 text-sm font-mono outline-none"
              aria-label="Select language"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-black text-gray-300">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col rounded-xl overflow-hidden border ${getColorClass("border")} bg-black/60 backdrop-blur-sm transition-all duration-300`}
        style={{ boxShadow: theme.glow }}
      >
        {/* Colorful top border */}
        <div className={`h-1 ${getColorClass("gradientBright")}`}></div>

        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-black/40 to-black/10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 backdrop-blur-sm transition-all duration-300 ${
                  message.sender === "user"
                    ? `${getColorClass("gradient")} ${getColorClass("border")} ${getColorClass("glow")}`
                    : "bg-gradient-to-r from-gray-800/70 to-gray-900/70 border border-gray-700"
                }`}
              >
                {message.sender === "user" && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-gray-400 font-mono">
                    <Mic className="w-3 h-3" />
                    <span>
                      Voice Message{" "}
                      {message.language && `(${availableLanguages.find((l) => l.code === message.language)?.name})`}
                    </span>
                  </div>
                )}

                <p className="text-gray-200 font-mono">{message.text}</p>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-800/50 border border-gray-700">
                <div className="flex gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getColorClass("bg")} animate-pulse`}
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${getColorClass("bg")} animate-pulse`}
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${getColorClass("bg")} animate-pulse`}
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice visualization panel */}
        {isListening && (
          <div className={`px-4 py-2 ${getColorClass("bg")} border-t ${getColorClass("border")}`}>
            <div className="flex justify-center items-center h-8">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`mx-0.5 rounded-full w-1 ${getColorClass("bgActive")}`}
                  style={{
                    height: `${voiceActivity * Math.sin((i / 16) * Math.PI) * 0.7 + 10}%`,
                    transition: "height 0.1s ease",
                  }}
                ></div>
              ))}
            </div>
            <p className={`text-center text-xs ${getColorClass("text")} font-mono mt-1`}>
              {isRecognitionActive ? "Listening... speak now" : "Initializing microphone..."}
            </p>
          </div>
        )}

        <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-md">
          <div className="flex gap-3">
            <button
              onClick={toggleListening}
              className={`relative p-4 rounded-full transition-all duration-300 ${
                isListening
                  ? `${getColorClass("bgActive")} ${getColorClass("borderActive")} ${getColorClass("textActive")} ${getColorClass("glowStrong")}`
                  : `${getColorClass("bg")} ${getColorClass("border")} ${getColorClass("text")}`
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {!micPermission ? (
                <WifiOff className="w-6 h-6" />
              ) : isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}

              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"></span>
                  <span
                    className="absolute inset-0 rounded-full animate-pulse opacity-40"
                    style={{
                      background: `radial-gradient(circle at center, ${theme.primary === "purple" ? "rgba(147,51,234,0.6)" : theme.primary === "emerald" ? "rgba(16,185,129,0.6)" : theme.primary === "amber" ? "rgba(217,119,6,0.6)" : "rgba(6,182,212,0.6)"} 0%, transparent 70%)`,
                      animationDuration: "1.5s",
                    }}
                  ></span>
                </>
              )}
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening to your voice..." : `Speak or type your message...`}
              className={`flex-1 bg-gray-900/70 border ${isListening ? getColorClass("borderActive") : getColorClass("border")} rounded-lg px-4 py-3 text-gray-200 font-mono resize-none focus:outline-none focus:ring-1 ${getColorClass("ring")} transition-all duration-300`}
              rows={1}
            />

            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-4 rounded-full transition-all duration-300 ${
                !inputMessage.trim() || isLoading
                  ? "bg-gray-800/50 border border-gray-700 text-gray-600"
                  : `${getColorClass("bg")} ${getColorClass("border")} ${getColorClass("text")} ${getColorClass("bgHover")}`
              }`}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>

          {/* Voice status indicator */}
          <div className="flex justify-center mt-3">
            <div
              className={`text-xs ${isListening ? getColorClass("text") : "text-gray-500"} font-mono flex items-center gap-2`}
            >
              {isListening ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Voice input active
                </>
              ) : isSpeaking ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Speaking response
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span>
                  {micPermission === false ? "Microphone access needed" : "Voice ready"}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChatbotContent

