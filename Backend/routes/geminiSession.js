const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { GoogleGenAI, createPartFromUri } = require("@google/genai");
const multer = require("multer");
const crypto = require("crypto");

const protect = require("../middleware/protect");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION =
  "You are an educational AI assistant helping students with their studies. Help with homework and assignments, explain academic concepts clearly, provide study tips and techniques, answer questions about various subjects (Math, Science, Programming, etc.), guide students step-by-step through problems. When analyzing images, explain what you see and how it relates to the question. ONLY answer study and education-related questions. If asked about non-educational topics, politely redirect to studies. Do not do homework for them - guide them to understand. Be concise but thorough. Use simple language and examples.";

// Helpers
const BASE_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "chat");

function removeFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  fs.rmSync(folderPath, { recursive: true, force: true });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanupOtherSessionsForUser(userId, keepSessionId = null) {
  const userDir = path.join(BASE_UPLOAD_DIR, String(userId));
  if (!fs.existsSync(userDir)) return;
  const children = fs.readdirSync(userDir);

  children.forEach((child) => {
    if (child === keepSessionId) return;
    removeFolder(path.join(userDir, child));
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.params.sessionId;
    const userId = req.user?._id?.toString() || "anonymous";
    const dest = path.join(BASE_UPLOAD_DIR, userId, sessionId);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const random = crypto.randomBytes(6).toString("hex");
    const ext = path.extname(file.originalname) || "";
    cb(null, `${Date.now()}-${random}${ext}`);
  },
});
const upload = multer({ storage });

// -------------------- ROUTES --------------------

// Start Session
router.post("/start-session", protect, async (req, res) => {
  try {
    const userId = String(req.user._id);
    const sessionId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    ensureDir(path.join(BASE_UPLOAD_DIR, userId, sessionId));
    cleanupOtherSessionsForUser(userId, sessionId);

    return res.json({ success: true, sessionId });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to start session" });
  }
});

// -------------------- TEXT CHAT --------------------
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [] } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: "sessionId required" });
    if (!message?.trim()) return res.status(400).json({ success: false, message: "message required" });

    // FIXED: Proper MIME handling
    const history = conversationHistory.map((m) => {
      const parts = [];

      if (m.text) parts.push({ type: "input_text", text: m.text });

      if (m.image && m.mime) {
        parts.push(
          createPartFromUri(
            `${process.env.BASE_URL}${m.image}`,
            m.mime
          )
        );
      }

      return {
        role: m.role === "user" ? "user" : "model",
        parts,
      };
    });

    const chat = await ai.chats.create({
      model: "gemini-2.5-flash",
      history,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
    });

    const gRes = await chat.sendMessage({ message });

    return res.json({ success: true, response: gRes.text });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "AI Chat error",
      error: err?.message,
    });
  }
});

// -------------------- IMAGE CHAT --------------------
router.post("/chat-with-image/:sessionId", protect, upload.single("image"), async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) return res.status(400).json({ success: false, message: "sessionId required" });

    const { message, conversationHistory } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "message required" });
    if (!req.file) return res.status(400).json({ success: false, message: "image file required" });

    const userId = String(req.user._id);
    const localRelativePath = `/uploads/chat/${userId}/${sessionId}/${req.file.filename}`;

    // Parse history
    let parsedHistory = [];
    try {
      parsedHistory = JSON.parse(conversationHistory || "[]");
    } catch {
      parsedHistory = [];
    }

    const contents = [];

    // FIXED: Proper MIME handling for history
    parsedHistory.forEach((m) => {
      const parts = [];

      if (m.text) parts.push({ text: m.text });

      if (m.image && m.mime) {
        parts.push(
          createPartFromUri(
            `${process.env.BASE_URL}${m.image}`,
            m.mime
          )
        );
      }

      contents.push({
        role: m.role === "user" ? "user" : "model",
        parts,
      });
    });

    // Upload the new image to Gemini (remote)
    const uploaded = await ai.files.upload({
      file: req.file.path,
      config: { mimeType: req.file.mimetype },
    });

    // Add new message
    contents.push({
      role: "user",
      parts: [
        { text: SYSTEM_INSTRUCTION + "\n\nStudent question: " + message },
        createPartFromUri(uploaded.uri, uploaded.mimeType),
      ],
    });

    // Generate content
    const gRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { temperature: 0.7 },
    });

    // Delete remote file
    try {
      await ai.files.delete({ name: uploaded.name });
    } catch {}

    return res.json({
      success: true,
      response: gRes.text,
      imagePath: localRelativePath,
      mime: req.file.mimetype,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "AI vision error",
      error: err?.message,
    });
  }
});

// -------------------- CLEAR SESSION --------------------
router.post("/clear", protect, async (req, res) => {
  try {
    const userId = String(req.user._id);
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ success: false, message: "sessionId required" });

    removeFolder(path.join(BASE_UPLOAD_DIR, userId, sessionId));

    return res.json({ success: true, message: "Cleared session files" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to clear session" });
  }
});

module.exports = router;
