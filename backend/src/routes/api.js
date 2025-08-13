const express = require("express");
const multer = require("multer");
const studyController = require("../controllers/studyController");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and TXT files are allowed."));
    }
  },
});

// Generate study materials
router.post("/generate", studyController.generateMaterial);

// Process file upload
router.post("/upload", upload.single("file"), studyController.processFile);

// Generate study plan
router.post("/generate-plan", upload.single("file"), studyController.generateStudyPlan);

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "StudyMate API is working!" });
});

module.exports = router;
