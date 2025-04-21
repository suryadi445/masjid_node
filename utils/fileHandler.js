// utils/fileHandler.js
const path = require("path");
const fs = require("fs");

// Allowed mimetypes
const allowedMimeTypes = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// Allowed extensions
const allowedExtensions = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  document: [".pdf", ".doc", ".docx"],
};

// Max file size in bytes
const maxSize = {
  image: 2 * 1024 * 1024, // 2 MB
  document: 3 * 1024 * 1024, // 3 MB
};

const isAllowedMime = (mimetype, type = "all") => {
  if (type === "image") return allowedMimeTypes.image.includes(mimetype);
  if (type === "document") return allowedMimeTypes.document.includes(mimetype);
  return (
    allowedMimeTypes.image.includes(mimetype) ||
    allowedMimeTypes.document.includes(mimetype)
  );
};

const isAllowedExtension = (filename, type = "all") => {
  const ext = path.extname(filename).toLowerCase();
  if (type === "image") return allowedExtensions.image.includes(ext);
  if (type === "document") return allowedExtensions.document.includes(ext);
  return (
    allowedExtensions.image.includes(ext) ||
    allowedExtensions.document.includes(ext)
  );
};

const isValidSize = (size, type = "all") => {
  if (type === "image") return size <= maxSize.image;
  if (type === "document") return size <= maxSize.document;
  return size <= Math.max(maxSize.image, maxSize.document);
};

// Main validator
/*
 * type = image or document
 */
const validateFile = (file, type = "all") => {
  if (!file) return { valid: false, error: "No file provided" };

  // Helper function to delete the file if it exists
  const deleteFileIfExists = (filepath) => {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  };

  // Validate mime type
  if (!isAllowedMime(file.mimetype, type)) {
    deleteFileIfExists(file.filepath);
    return { valid: false, error: "Invalid file type" };
  }

  // Validate file extension
  if (!isAllowedExtension(file.originalFilename || file.name, type)) {
    deleteFileIfExists(file.filepath);
    return { valid: false, error: "Invalid file extension" };
  }

  // Validate file size
  if (!isValidSize(file.size, type)) {
    deleteFileIfExists(file.filepath);
    return { valid: false, error: "File size too large" };
  }

  return { valid: true };
};

// Move and rename file
const moveUploadedFile = (file, targetDir) => {
  const fileExtension = path.extname(file.originalFilename);
  const newFileName = `${Date.now()}${fileExtension}`;
  const newPath = path.join(targetDir, newFileName);

  fs.renameSync(file.filepath, newPath);

  return {
    newFileName,
    newPath,
  };
};

module.exports = {
  validateFile,
  moveUploadedFile,
};
