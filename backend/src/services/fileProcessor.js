const pdfParse = require("pdf-parse");

class FileProcessor {
  async extractText(file) {
    try {
      switch (file.mimetype) {
        case "application/pdf":
          return await this.extractFromPDF(file.buffer);
        case "text/plain":
          return file.buffer.toString("utf-8");
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }
    } catch (error) {
      throw new Error(`File extraction failed: ${error.message}`);
    }
  }

  async extractFromPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }
}

module.exports = new FileProcessor();
