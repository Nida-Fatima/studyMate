const openaiService = require("../services/openaiService");
const fileProcessor = require("../services/fileProcessor");

class StudyController {
  async generateMaterial(req, res) {
    try {
      const { content, format, difficulty, length } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({
          error: "Content is required",
          message: "Please provide content to generate study materials",
        });
      }

      if (!["summary", "flashcards", "quiz", "outline"].includes(format)) {
        return res.status(400).json({
          error: "Invalid format",
          message: "Format must be one of: summary, flashcards, quiz, outline",
        });
      }

      const generatedContent = await openaiService.generateStudyMaterial(
        content,
        format,
        difficulty,
        length
      );

      res.json({
        success: true,
        format,
        difficulty,
        length,
        content: generatedContent,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Study generation error:", error);
      res.status(500).json({
        error: "Generation failed",
        message: error.message || "Failed to generate study material",
      });
    }
  }

  async processFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          message: "Please upload a file",
        });
      }

      const extractedText = await fileProcessor.extractText(req.file);

      res.json({
        success: true,
        filename: req.file.originalname,
        content: extractedText,
        fileSize: req.file.size,
      });
    } catch (error) {
      console.error("File processing error:", error);
      res.status(500).json({
        error: "File processing failed",
        message: error.message || "Failed to process file",
      });
    }
  }

  async generateStudyPlan(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          message: "Please upload study material.",
        });
      }

      const { daysToPrepare, hoursPerDay } = req.body;
      if (!daysToPrepare || daysToPrepare <= 0) {
        return res.status(400).json({
          error: "Days to prepare missing",
          message: "Please provide the number of days you have to prepare.",
        });
      }
      if (!hoursPerDay || hoursPerDay <= 0) {
        return res.status(400).json({
          error: "Hours per day missing",
          message: "Please specify how many hours you can give per day.",
        });
      }

      const extractedText = await fileProcessor.extractText(req.file);

      const studyPlan = await openaiService.generateStudyPlan(
        extractedText,
        daysToPrepare,
        hoursPerDay
      );

      res.json({
        success: true,
        plan: studyPlan,
      });
    } catch (error) {
      console.error("Study plan generation error:", error);
      res.status(500).json({
        error: "Study plan generation failed",
        message: error.message || "Failed to generate study plan",
      });
    }
  }
}

module.exports = new StudyController();
