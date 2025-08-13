

import React, { useState, useRef } from 'react';
import { Upload, Calendar, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';





const StudyPlanner = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [daysToPrepare, setDeadline] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setError('');
    }
  };

  const handleGeneratePlan = async () => {
    if (!uploadedFile) {
      setError('Please upload your study material.');
      return;
    }
    if (!daysToPrepare) {
      setError('Please set a daysToPrepare for your study plan.');
      return;
    }
    if (!hoursPerDay || hoursPerDay <= 0) {
      setError('Please specify how many hours you can give per day.');
      return;
    }

    setLoading(true);
    setError('');
    setStudyPlan('');

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('daysToPrepare', daysToPrepare);
    formData.append('hoursPerDay', hoursPerDay);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setStudyPlan(data.plan);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate study plan.');
      }
    } catch (err) {
      console.error('Error generating study plan:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100">
      {/* Header - Reusing StudyMate's header structure */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Study Planner
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Organization</p>
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
      <main className="relative flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg mr-3">
                <Upload className="h-5 w-5 text-white" />
              </div>
              Upload Material & Set Deadline
            </h2>

            {/* File Upload */}
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 text-center hover:border-purple-400 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 group"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400 group-hover:text-purple-500 transition-colors" />
                <p className="text-gray-600 font-medium">
                  Upload PDF or TXT file
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to browse
                </p>
                {uploadedFile && (
                  <div className="mt-3 p-2 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">
                      ✓ {uploadedFile.name} uploaded
                    </p>
                  </div>
                )}
              </button>
            </div>

            {/* Days to Prepare Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Days you have to prepare:
              </label>
              <input
                type="number"
                value={daysToPrepare}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
                placeholder="e.g., 7"
                min="1"
              />
            </div>

            {/* Hours Per Day Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hours you can give per day:
              </label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
                placeholder="e.g., 2"
                min="0.5"
                step="0.5"
              />
            </div>

            {/* Generate Plan Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={loading || !uploadedFile || !daysToPrepare || !hoursPerDay}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating Plan...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Study Plan
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Generated Study Plan
            </h2>
            <div className="min-h-[400px] prose prose-sm max-w-none bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-inner">
              {studyPlan ? (
                <ReactMarkdown>{studyPlan}</ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-gray-400">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-purple-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">
                      Your AI-generated study plan will appear here
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Upload material and set a daysToPrepare to generate your plan
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Reusing StudyMate's footer structure */}
      <footer className="relative bg-white/50 backdrop-blur-lg border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600">
              Built with ❤️ using AI • Plan your studies instantly
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Note: Connect to OpenRouter API for full functionality
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudyPlanner;