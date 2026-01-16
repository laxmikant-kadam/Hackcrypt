import { useState, useRef, useEffect } from "react"
import {
  Mic,
  Upload,
  ChevronLeft,
  ChevronRight,
  Search,
  ZoomIn,
  ZoomOut,
  FileText,
  Sparkles,
  Volume2,
  ArrowLeft,
  Settings,
  Eye,
  Bookmark,
  Share2,
  Download,
  Info
} from "lucide-react"

export default function PDFReader() {
  const [pdfInfo, setPdfInfo] = useState({
    text: "",
    pages: [],
    currentPage: 1,
    totalPages: 0,
    filename: null,
    searchResults: [],
    currentMatch: 0,
  })
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isListening, setIsListening] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isReading, setIsReading] = useState(false)
  const [voiceFeedback, setVoiceFeedback] = useState("")
  const [viewMode, setViewMode] = useState("document") // document, night, sepia
  const [bookmarks, setBookmarks] = useState([])
  const [showCommandsList, setShowCommandsList] = useState(false)
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize voice recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")
        handleVoiceCommand(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }
    }
  }, [])

  // Toggle voice recognition
  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.start()
      } else {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  // Load PDF from backend
  const loadPDF = async (file) => {
    // In a real implementation, this would send the file to a backend
    // For demo purposes, we'll simulate loading a PDF
    const mockPages = [
      "This is the first page of the PDF document. It contains sample text to demonstrate the PDF reader functionality. FlexOS PDF Reader uses advanced AI to analyze and process documents quickly.",
      "This is the second page with more sample content. The FlexOS PDF Reader allows you to navigate through pages, search for text, and use voice commands. The system integrates with FlexOS's other AI components.",
      "This is the third page of the document. You can zoom in and out, and the reader can even read the content aloud to you using text-to-speech technology. Voice authentication can be used for secure document access.",
      "This is the fourth and final page of this sample document. Voice commands like 'next page', 'zoom in', or 'search for text' make navigation effortless. The reader can also integrate with FaceVault for additional security features.",
    ]

    setPdfInfo({
      text: mockPages.join("\n\n--- PAGE BREAK ---\n\n"),
      pages: mockPages,
      currentPage: 1,
      totalPages: mockPages.length,
      filename: file ? file.name : "flexos-documentation.pdf",
      searchResults: [],
      currentMatch: 0,
    })
  }

  // Simulate loading a sample PDF on component mount
  useEffect(() => {
    loadPDF(null)
  }, [])

  // Text-to-speech functionality
  const readAloud = (text) => {
    if (!text) return

    setIsReading(true)

    // Using the browser's built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsReading(false)

    window.speechSynthesis.cancel() // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance)
  }

  const stopReading = () => {
    window.speechSynthesis.cancel()
    setIsReading(false)
  }

  // Handle page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= pdfInfo.totalPages) {
      setPdfInfo((prev) => ({ ...prev, currentPage: page }))
    }
  }

  // Add bookmark
  const toggleBookmark = () => {
    const currentBookmarks = [...bookmarks]
    const currentPageIndex = currentBookmarks.findIndex(b => b.page === pdfInfo.currentPage)

    if (currentPageIndex >= 0) {
      // Remove existing bookmark
      currentBookmarks.splice(currentPageIndex, 1)
    } else {
      // Add new bookmark
      currentBookmarks.push({
        page: pdfInfo.currentPage,
        text: `Page ${pdfInfo.currentPage} bookmark`,
        timestamp: new Date()
      })
    }

    setBookmarks(currentBookmarks)

    // Provide feedback
    const feedback = currentPageIndex >= 0 ? "Bookmark removed" : "Bookmark added"
    setVoiceFeedback(feedback)
    setTimeout(() => setVoiceFeedback(""), 2000)
  }

  // Handle voice commands
  const handleVoiceCommand = (command) => {
    const cmd = command.toLowerCase()
    let feedback = ""

    if (cmd.includes("next page") && pdfInfo.currentPage < pdfInfo.totalPages) {
      goToPage(pdfInfo.currentPage + 1)
      feedback = `Page ${pdfInfo.currentPage + 1}`
    } else if (cmd.includes("previous page") && pdfInfo.currentPage > 1) {
      goToPage(pdfInfo.currentPage - 1)
      feedback = `Page ${pdfInfo.currentPage - 1}`
    } else if (cmd.includes("zoom in")) {
      setZoomLevel((prev) => Math.min(prev + 10, 200))
      feedback = `Zoomed in to ${zoomLevel + 10}%`
    } else if (cmd.includes("zoom out")) {
      setZoomLevel((prev) => Math.max(prev - 10, 50))
      feedback = `Zoomed out to ${zoomLevel - 10}%`
    } else if (cmd.includes("search for")) {
      const term = cmd.replace("search for", "").trim()
      setSearchTerm(term)
      handleSearch(term)
      feedback = `Searching for ${term}`
    } else if (cmd.includes("read") || cmd.includes("speak")) {
      readAloud(getCurrentPageText())
      feedback = `Reading page ${pdfInfo.currentPage}`
    } else if (cmd.includes("stop")) {
      stopReading()
      feedback = "Stopped reading"
    } else if (cmd.includes("go to page")) {
      const pageMatch = cmd.match(/go to page (\d+)/)
      if (pageMatch) {
        const pageNum = Number.parseInt(pageMatch[1])
        if (pageNum >= 1 && pageNum <= pdfInfo.totalPages) {
          goToPage(pageNum)
          feedback = `Jumped to page ${pageNum}`
        }
      }
    } else if (cmd.includes("bookmark") || cmd.includes("mark page")) {
      toggleBookmark()
      feedback = "Bookmark toggled"
    } else if (cmd.includes("night mode") || cmd.includes("dark mode")) {
      setViewMode("night")
      feedback = "Night mode activated"
    } else if (cmd.includes("day mode") || cmd.includes("light mode")) {
      setViewMode("document")
      feedback = "Document mode activated"
    }

    if (feedback) {
      setVoiceFeedback(feedback)
      setTimeout(() => setVoiceFeedback(""), 3000)
    }
  }

  // Search functionality
  const handleSearch = (term) => {
    if (!term || !pdfInfo.pages.length) return

    const results = []

    pdfInfo.pages.forEach((pageText, pageIndex) => {
      const pageNumber = pageIndex + 1
      const regex = new RegExp(term, "gi")
      const matches = (pageText.match(regex) || []).length

      if (matches > 0) {
        // Find a snippet of context around the first match
        const lowerText = pageText.toLowerCase()
        const termIndex = lowerText.indexOf(term.toLowerCase())
        const start = Math.max(0, termIndex - 20)
        const end = Math.min(pageText.length, termIndex + term.length + 20)
        const context = pageText.substring(start, end)

        results.push({
          page: pageNumber,
          matches,
          context,
        })
      }
    })

    setPdfInfo((prev) => ({
      ...prev,
      searchResults: results,
      currentMatch: 0,
    }))

    if (results.length > 0) {
      goToPage(results[0].page)
    }
  }

  // Get current page text
  const getCurrentPageText = () => {
    return pdfInfo.pages[pdfInfo.currentPage - 1] || "No content available"
  }

  // Check if current page is bookmarked
  const isCurrentPageBookmarked = () => {
    return bookmarks.some(b => b.page === pdfInfo.currentPage)
  }

  // Highlight search terms in text
  const highlightSearchTerms = (text) => {
    if (!searchTerm) return text

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark
          key={i}
          className="bg-cyan-900 bg-opacity-20 text-cyan-400 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Format text with paragraphs
  const formatTextWithParagraphs = (text) => {
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph || <br />}
      </p>
    ))
  }

  // Get background color based on view mode
  const getBackgroundColor = () => {
    switch(viewMode) {
      case "night":
        return "bg-[#0a0e1a]"
      case "sepia":
        return "bg-[#f4f1ea]"
      default:
        return "bg-[#121726]"
    }
  }

  // Get text color based on view mode
  const getTextColor = () => {
    switch(viewMode) {
      case "night":
        return "text-[#a4cedf]"
      case "sepia":
        return "text-[#5f4b32]"
      default:
        return "text-[#e6f8fa]"
    }
  }

  // Get border color based on view mode
  const getBorderColor = () => {
    switch(viewMode) {
      case "night":
        return "border-[#1e293b]"
      case "sepia":
        return "border-[#d3c6ad]"
      default:
        return "border-[#1e293b]"
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e6f8fa] font-mono relative">
      {/* CSS for futuristic UI */}
      <style jsx global>{`
        :root {
          --accent-color: #00b9d1;
          --accent-color-dark: #008a9e;
          --bg-dark: #0a0e1a;
          --bg-panel: #0f172a;
          --bg-content: #1a2234;
          --border-color: #1e293b;
          --text-primary: #e6f8fa;
          --text-secondary: #94a3b8;
        }

        .grid-bg {
          background-image: linear-gradient(to right, rgba(0, 185, 209, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 185, 209, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .pulse {
          animation: pulse 3s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .glow {
          box-shadow: 0 0 15px rgba(0, 185, 209, 0.3);
        }

        .glow-text {
          text-shadow: 0 0 5px rgba(0, 185, 209, 0.5);
        }
      `}</style>

      {/* Grid background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-50 grid-bg"></div>

      {/* Hidden audio element and file input */}
      <audio ref={audioRef} />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={(e) => e.target.files[0] && loadPDF(e.target.files[0])}
        className="hidden"
      />

      {/* Voice Commands Help */}
      {showCommandsList && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-[#121726] border border-cyan-500 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-cyan-400 glow-text">VOICE CONTROLS</h2>
              <button 
                onClick={() => setShowCommandsList(false)}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <h3 className="text-cyan-400 mb-2">Advanced Voice Based Features</h3>
            <p className="text-cyan-200 text-sm mb-4">for seamless interaction control</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-cyan-800 bg-cyan-900 bg-opacity-20 p-3 rounded">
                <p className="font-bold text-cyan-400">Navigation</p>
                <ul className="text-sm text-cyan-200 mt-1">
                  <li>"Next page"</li>
                  <li>"Previous page"</li>
                  <li>"Go to page [number]"</li>
                </ul>
              </div>
              
              <div className="border border-cyan-800 bg-cyan-900 bg-opacity-20 p-3 rounded">
                <p className="font-bold text-cyan-400">View Control</p>
                <ul className="text-sm text-cyan-200 mt-1">
                  <li>"Zoom in"</li>
                  <li>"Zoom out"</li>
                  <li>"Night mode" / "Day mode"</li>
                </ul>
              </div>
              
              <div className="border border-cyan-800 bg-cyan-900 bg-opacity-20 p-3 rounded">
                <p className="font-bold text-cyan-400">Reading</p>
                <ul className="text-sm text-cyan-200 mt-1">
                  <li>"Read" / "Speak"</li>
                  <li>"Stop"</li>
                </ul>
              </div>
              
              <div className="border border-cyan-800 bg-cyan-900 bg-opacity-20 p-3 rounded">
                <p className="font-bold text-cyan-400">Tools</p>
                <ul className="text-sm text-cyan-200 mt-1">
                  <li>"Search for [text]"</li>
                  <li>"Bookmark" / "Mark page"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice feedback notification */}
      {voiceFeedback && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-900 bg-opacity-20 text-cyan-100 py-2 px-4 rounded border border-cyan-500 z-50 flex items-center gap-2 pulse">
          <Mic size={16} />
          {voiceFeedback}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-3 sticky top-0 z-40 bg-gradient-to-r from-[#0f172a] to-[#121729] border-b border-[#1e293b] shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded bg-cyan-900 bg-opacity-10 text-cyan-400 border border-cyan-800 hover:bg-opacity-20 transition-all"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center">
            <div className="mr-3 p-2 rounded bg-cyan-900 bg-opacity-10 text-cyan-400 border border-cyan-800">
              <FileText size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-cyan-100 mb-0.5">
                {pdfInfo.filename || "No File"}
              </h1>
              <div className="text-xs text-cyan-300">
                FlexOS PDF Reader
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-2 rounded border transition-all ${isListening 
              ? "bg-red-900 bg-opacity-20 border-red-700 text-red-400" 
              : "bg-cyan-900 bg-opacity-10 border-cyan-800 text-cyan-400 hover:bg-opacity-20"}`}
          >
            <Mic size={18} />
          </button>

          <button
            onClick={isReading ? stopReading : () => readAloud(getCurrentPageText())}
            className={`p-2 rounded border transition-all ${isReading 
              ? "bg-red-900 bg-opacity-20 border-red-700 text-red-400" 
              : "bg-cyan-900 bg-opacity-10 border-cyan-800 text-cyan-400 hover:bg-opacity-20"}`}
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded border transition-all ${isCurrentPageBookmarked()
              ? "bg-cyan-900 bg-opacity-20 border-cyan-600 text-cyan-300" 
              : "bg-cyan-900 bg-opacity-10 border-cyan-800 text-cyan-400 hover:bg-opacity-20"}`}
          >
            <Bookmark size={18} />
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 hover:bg-opacity-20 transition-all"
          >
            <Upload size={18} />
          </button>

          <div className="w-px h-6 bg-[#1e293b]"></div>

          <button
            onClick={() => setShowCommandsList(true)}
            className="p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 hover:bg-opacity-20 transition-all"
          >
            <Mic size={18} />
          </button>

          <button
            className="p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 hover:bg-opacity-20 transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex relative h-[calc(100vh-120px)]">
        {/* Left Sidebar - Bookmarks, Search, etc. */}
        <div className="w-64 m-4 mr-0 flex flex-col relative z-20 bg-[#0f172a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
          {/* Search */}
          <div className="p-4 border-b border-[#1e293b]">
            <h3 className="text-sm font-bold mb-3 text-cyan-400 flex items-center gap-2">
              <Search size={14} />
              Search Document
            </h3>
            <div className="relative w-full mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
                placeholder="Search text..."
                className="w-full bg-[#1a2234] border border-[#2a3244] rounded-md p-2 text-[#e6f8fa] outline-none focus:border-cyan-500 transition-all"
              />
              <button
                onClick={() => handleSearch(searchTerm)}
                className="w-full bg-transparent text-cyan-400 border border-cyan-700 rounded p-2 mt-2 hover:bg-cyan-900 hover:bg-opacity-20 transition-all flex justify-center"
              >
                Search
              </button>
            </div>
          </div>

          {/* Bookmarks */}
          <div className="p-4 border-b border-[#1e293b] flex-1 overflow-auto">
            <h3 className="text-sm font-bold mb-3 text-cyan-400 flex items-center gap-2">
              <Bookmark size={14} />
              Bookmarks
            </h3>

            {bookmarks.length === 0 ? (
              <div className="text-xs text-center text-cyan-200 py-4">
                No bookmarks yet.
                <br />
                <span className="text-cyan-400">Say "bookmark page"</span> to add one.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {bookmarks.map((bookmark, i) => (
                  <div
                    key={i}
                    className={`p-2 ${pdfInfo.currentPage === bookmark.page ? "bg-cyan-900 bg-opacity-10" : ""} rounded cursor-pointer border border-cyan-800 text-xs hover:border-cyan-600 transition-all`}
                    onClick={() => goToPage(bookmark.page)}
                  >
                    <div className="font-bold text-cyan-400">Page {bookmark.page}</div>
                    <div className="text-cyan-200 text-[0.65rem]">
                      {new Date(bookmark.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Results */}
          {pdfInfo.searchResults.length > 0 && (
            <div className="p-4 border-b border-[#1e293b] max-h-48 overflow-auto">
              <h3 className="text-sm font-bold mb-3 text-cyan-400 flex items-center gap-2">
                <Search size={14} />
                Search Results
              </h3>

              <div className="flex flex-col gap-2">
                {pdfInfo.searchResults.map((result, i) => (
                  <div
                    key={i}
                    className={`p-2 text-xs cursor-pointer rounded ${pdfInfo.currentPage === result.page ? "bg-cyan-900 bg-opacity-10" : ""} border border-cyan-800 hover:border-cyan-600 transition-all`}
                    onClick={() => goToPage(result.page)}
                  >
                    <div className="font-bold text-cyan-400">Page {result.page}</div>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-cyan-200">
                      ...{result.context}...
                    </div>
                    <div className="text-cyan-400 mt-1">
                      {result.matches} match{result.matches !== 1 ? "es" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Settings */}
          <div className="p-4">
            <h3 className="text-sm font-bold mb-3 text-cyan-400 flex items-center gap-2">
              <Eye size={14} />
              View Mode
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("document")}
                className={`flex-1 p-2 rounded text-xs border ${viewMode === "document" 
                  ? "bg-cyan-900 bg-opacity-20 border-cyan-600 text-cyan-300" 
                  : "bg-cyan-900 bg-opacity-5 border-cyan-800 text-cyan-400 hover:bg-opacity-10"} transition-all`}
              >
                Document
              </button>
              <button
                onClick={() => setViewMode("night")}
                className={`flex-1 p-2 rounded text-xs border ${viewMode === "night" 
                  ? "bg-cyan-900 bg-opacity-20 border-cyan-600 text-cyan-300" 
                  : "bg-cyan-900 bg-opacity-5 border-cyan-800 text-cyan-400 hover:bg-opacity-10"} transition-all`}
              >
                Night
              </button>
              <button
                onClick={() => setViewMode("sepia")}
                className={`flex-1 p-2 rounded text-xs border ${viewMode === "sepia" 
                  ? "bg-cyan-900 bg-opacity-20 border-cyan-600 text-cyan-300" 
                  : "bg-cyan-900 bg-opacity-5 border-cyan-800 text-cyan-400 hover:bg-opacity-10"} transition-all`}
              >
                Sepia
              </button>
            </div>
          </div>
        </div>

        {/* Main PDF Content */}
        <div className="flex-1 flex flex-col m-4">
          {/* PDF Content Display */}
          <div className="flex-1 flex flex-col relative bg-[#0f172a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
            {pdfInfo.text ? (
              <div className="flex-1 overflow-auto p-2">
                <div className={`relative min-h-full p-8 ${getBackgroundColor()} ${getTextColor()} ${getBorderColor()} border rounded`}>
                  {/* Page number indicator */}
                  <div className="absolute top-4 right-4 bg-cyan-900 bg-opacity-10 rounded px-2 py-1 text-xs text-cyan-400 border border-cyan-800">
                    Page {pdfInfo.currentPage} of {pdfInfo.totalPages}
                  </div>

                  {/* Bookmark indicator */}
                  {isCurrentPageBookmarked() && (
                    <div className="absolute top-4 left-4 text-cyan-400">
                      <Bookmark size={18} fill="#00b9d1" />
                    </div>
                  )}
                  
                  {/* Page content */}
                  <div style={{fontSize: `${zoomLevel}%`}} className="leading-relaxed">
                    {formatTextWithParagraphs(highlightSearchTerms(getCurrentPageText()))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-cyan-200">
                <div className="text-center p-8">
                  <Upload size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="mb-2">No PDF Loaded</h3>
                  <p className="mb-4 text-sm">
                    Upload a PDF file or use voice commands to load a document
                  </p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-transparent py-2 px-4 rounded border border-cyan-500 text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-20 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Upload size={16} />
                    Upload PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center p-3 mt-2 rounded-lg bg-gradient-to-r from-[#0f172a] to-[#121729] border border-[#1e293b]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(pdfInfo.currentPage - 1)}
                disabled={pdfInfo.currentPage <= 1}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${pdfInfo.currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="min-w-16 text-center text-sm text-cyan-200">
                {pdfInfo.currentPage} / {pdfInfo.totalPages}
              </div>

                            <button
                onClick={() => goToPage(pdfInfo.currentPage + 1)}
                disabled={pdfInfo.currentPage >= pdfInfo.totalPages}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${pdfInfo.currentPage >= pdfInfo.totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
                disabled={zoomLevel <= 50}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${zoomLevel <= 50 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <ZoomOut size={18} />
              </button>

              <div className="min-w-16 text-center text-sm text-cyan-200">
                {zoomLevel}%
              </div>

              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
                disabled={zoomLevel >= 200}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${zoomLevel >= 200 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <ZoomIn size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => readAloud(getCurrentPageText())}
                disabled={!pdfInfo.text}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${!pdfInfo.text ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <Volume2 size={18} />
              </button>

              <button
                onClick={() => {
                  const textToShare = `${pdfInfo.filename}\n\nPage ${pdfInfo.currentPage}:\n${getCurrentPageText().substring(0, 100)}...`;
                  navigator.clipboard.writeText(textToShare);
                  setVoiceFeedback("Copied to clipboard");
                  setTimeout(() => setVoiceFeedback(""), 2000);
                }}
                disabled={!pdfInfo.text}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${!pdfInfo.text ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <Share2 size={18} />
              </button>

              <button
                onClick={() => {
                  // In a real implementation, this would download the PDF
                  // For demo, we'll create a text file with the content
                  const element = document.createElement("a");
                  const file = new Blob([pdfInfo.text], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = pdfInfo.filename ? pdfInfo.filename.replace('.pdf', '.txt') : "document.txt";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                disabled={!pdfInfo.text}
                className={`p-2 rounded bg-cyan-900 bg-opacity-10 border border-cyan-800 text-cyan-400 ${!pdfInfo.text ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"} transition-all`}
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}