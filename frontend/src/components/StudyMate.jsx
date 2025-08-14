import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Brain,
  Download,
  Copy,
  RotateCcw,
  Settings,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";

const StudyMate = () => {
  const [inputText, setInputText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("summary");
  const [difficulty, setDifficulty] = useState("medium");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const showToastMessage = (message = "Copied to clipboard ✅") => {
    setShowToast(message);
    setTimeout(() => setShowToast(""), 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setError("");
      setIsUploading(true);

      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputText(event.target.result);
          setIsUploading(false);
        };
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}api/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            setInputText(data.content);
            showToastMessage("PDF processed successfully! ✅");
          } else {
            const errorData = await response.json();
            setError(errorData.message || "Failed to process PDF");
          }
        } catch (error) {
          setError("Failed to upload file. Make sure backend is running.");
          setInputText(
            `[PDF file "${file.name}" uploaded. Backend connection needed for automatic extraction. Please paste the text content manually.]`
          );
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const callBackendAPI = async (content, format, difficulty, length) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}api/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            format,
            difficulty,
            length,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "API call failed");
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Backend API Error:", error);
      // Fallback for demo when backend is not running
      return generateFallbackContent(format);
    }
  };

  const generateFallbackContent = (format) => {
    // Fallback content generation for demo when backend is not connected
    if (format === "summary") {
      return generateSummaryFromContent(inputText, difficulty, length);
    } else if (format === "flashcards") {
      return generateFlashcardsFromContent(inputText, difficulty, length);
    } else if (format === "quiz") {
      return generateQuizFromContent(inputText, difficulty, length);
    } else if (format === "outline") {
      return generateOutlineFromContent(inputText, difficulty, length);
    }
  };

  const generateSummaryFromContent = (text, diff, len) => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    const lengths = { short: 3, medium: 5, long: 8 };
    const numPoints = Math.min(lengths[len] || 5, sentences.length);

    const keyPoints = sentences
      .slice(0, numPoints)
      .map((sentence) => `• ${sentence.trim()}`);

    // Extract key terms
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
    ];
    const keyTerms = [
      ...new Set(
        words.filter((word) => word.length > 5 && !commonWords.includes(word))
      ),
    ]
      .slice(0, 5)
      .map((term) => `• **${term.charAt(0).toUpperCase() + term.slice(1)}**`);

    return `# 📚 Study Summary\n\n## Key Points\n\n${keyPoints.join(
      "\n"
    )}\n\n## Important Terms\n\n${keyTerms.join(
      "\n"
    )}\n\n## Study Focus\n\n✓ Review main concepts\n✓ Understand key terminology\n✓ Make connections between ideas\n✓ Practice explaining concepts`;
  };

  const generateFlashcardsFromContent = (text, diff, len) => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 15);
    const lengths = { short: 4, medium: 6, long: 10 };
    const numCards = Math.min(lengths[len] || 6, sentences.length);

    const cards = sentences.slice(0, numCards).map((sentence, i) => {
      const cleanSentence = sentence.trim();
      let question, answer;

      if (cleanSentence.includes(" is ") || cleanSentence.includes(" are ")) {
        const parts = cleanSentence.split(/ is | are /);
        question = `What ${
          cleanSentence.includes(" are ") ? "are" : "is"
        } ${parts[0].trim()}?`;
        answer = parts[1] ? parts[1].trim() : cleanSentence;
      } else {
        const words = cleanSentence.split(" ");
        const keyWord = words.find((w) => w.length > 6) || words[0];
        question = `What can you explain about "${keyWord}"?`;
        answer = cleanSentence;
      }

      return { question, answer };
    });

    return `# 🃏 Flashcards\n\n${cards
      .map(
        (card, i) =>
          `## Card ${i + 1}\n\n**Q:** ${card.question}\n\n**A:** ${
            card.answer
          }\n\n---\n`
      )
      .join("\n")}`;
  };

  const generateQuizFromContent = (text, diff, len) => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    const lengths = { short: 3, medium: 5, long: 7 };
    const numQuestions = Math.min(
      lengths[len] || 5,
      Math.floor(sentences.length / 2)
    );

    const questions = sentences.slice(0, numQuestions).map((sentence, i) => {
      const cleanSentence = sentence.trim();

      if (i % 2 === 0) {
        // Multiple choice question
        return `## Question ${
          i + 1
        } (Multiple Choice)\nBased on the content, which statement is correct?\n\nA) ${cleanSentence}\nB) This is not mentioned in the content\nC) The opposite of the statement above\nD) Cannot be determined\n\n**Answer: A**\n`;
      } else {
        // Short answer question
        return `## Question ${
          i + 1
        } (Short Answer)\nExplain the concept mentioned in this statement: "${cleanSentence.slice(
          0,
          80
        )}..."\n\n**Sample Answer:** ${cleanSentence}\n`;
      }
    });

    return `# 📝 Practice Quiz\n\n${questions.join("\n")}`;
  };

  const generateOutlineFromContent = (text, diff, len) => {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const lengths = { short: 3, medium: 5, long: 8 };
    const maxSections = Math.min(lengths[len] || 5, paragraphs.length);

    let outline = "# 📋 Study Outline\n\n";

    paragraphs.slice(0, maxSections).forEach((paragraph, i) => {
      const sentences = paragraph
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 10);
      const title = sentences[0]
        ? sentences[0].trim().slice(0, 60) + "..."
        : `Section ${i + 1}`;

      outline += `## ${String.fromCharCode(73 + i)}. ${title}\n`;

      sentences.slice(1, 4).forEach((sentence, j) => {
        if (sentence.trim()) {
          outline += `   ${String.fromCharCode(65 + j)}. ${sentence
            .trim()
            .slice(0, 80)}...\n`;
        }
      });
      outline += "\n";
    });

    return outline;
  };

  const generateStudyMaterial = async () => {
    if (!inputText.trim()) {
      setError("Please enter some content to generate study materials.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const content = await callBackendAPI(
        inputText,
        selectedFormat,
        difficulty,
        length
      );
      setGeneratedContent(content);
      showToastMessage("Study material generated! ✨");
    } catch (error) {
      setError("Failed to generate study material. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    showToastMessage();
  };

  const exportContent = () => {
    const element = document.getElementById("pdf-content");
    html2pdf()
      .from(element)
      .set({
        margin: [10, 10, 10, 10], // top, left, bottom, right
        filename: `study-material-${selectedFormat}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 4 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const renderFileUploadButton = () => {
    if (isUploading) {
      return (
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-purple-500" />
          <p className="ml-2 text-gray-600 font-medium">Uploading...</p>
        </div>
      );
    }

    return (
      <>
        <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400 group-hover:text-purple-500 transition-colors" />
        <p className="text-gray-600 font-medium">
          Upload PDF, DOC, or TXT file
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Drag and drop or click to browse
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  StudyMate
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Learning</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <a
                href="/"
                className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                Generate Material
              </a>
              <a
                href="/study-planner"
                className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                Study Planner
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Input Panel */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Input Content
            </h2>

            {/* File Upload */}
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                disabled={isUploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-center hover:border-purple-400 hover:from-purple-100 hover:to-blue-100 transition-all duration-300 group"
              >
                {renderFileUploadButton()}
                {uploadedFile && !isUploading && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      ✓ {uploadedFile.name} uploaded
                    </p>
                  </div>
                )}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Or paste your content:
              </label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your study material here..."
                  className="w-full h-40 p-4 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white/80 backdrop-blur-sm transition-all duration-200"
                  maxLength={5000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-md">
                  {inputText.length} / 5000
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              {/* Format Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Study Format:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "summary",
                      label: "Summary",
                      icon: "📚",
                      gradient: "from-blue-500 to-cyan-500",
                    },
                    {
                      id: "flashcards",
                      label: "Flashcards",
                      icon: "🃏",
                      gradient: "from-purple-500 to-pink-500",
                    },
                    {
                      id: "quiz",
                      label: "Quiz",
                      icon: "📝",
                      gradient: "from-green-500 to-emerald-500",
                    },
                    {
                      id: "outline",
                      label: "Outline",
                      icon: "📋",
                      gradient: "from-orange-500 to-red-500",
                    },
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
                        selectedFormat === format.id
                          ? `border-transparent bg-gradient-to-r ${format.gradient} text-white shadow-lg transform scale-105`
                          : "border-gray-200 bg-white/80 hover:border-purple-300 hover:bg-white/90"
                      }`}
                    >
                      <div className="text-lg mb-1">{format.icon}</div>
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Settings */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Difficulty:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm px-3"
                  >
                    <option value="basic">Basic</option>
                    <option value="medium">Medium</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Length:
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateStudyMaterial}
              disabled={!inputText.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating with AI...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Study Material
                </div>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                Generated Content
              </h2>
              {generatedContent && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-all duration-200 hover:bg-purple-100 rounded-lg"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={exportContent}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-all duration-200 hover:bg-blue-100 rounded-lg"
                    title="Download as file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <a
                    href="/study-planner"
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200 hover:bg-purple-100 rounded-lg"
                    title="Generate Study Plan"
                  >
                    <Brain className="h-4 w-4" />
                  </a>
                  <button
                    onClick={generateStudyMaterial}
                    className="p-2 text-gray-400 hover:text-green-600 transition-all duration-200 hover:bg-green-100 rounded-lg"
                    title="Regenerate"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-[400px]">
              {generatedContent ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-inner">
                    {generatedContent}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-gray-400">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="h-12 w-12 text-purple-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">
                      Your AI-generated study material will appear here
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Add content and click generate to start
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          id="pdf-content"
          style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
        >
          <ReactMarkdown>{generatedContent}</ReactMarkdown>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center animate-slide-up backdrop-blur-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            {showToast}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-white/50 backdrop-blur-lg border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600">
              Built with ❤️ using AI • Transform any content into study
              materials instantly
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StudyMate;
