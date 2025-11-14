import api from "./api";

export const geminiService = {
  startSession: async () => {
    const response = await api.post("/gemini/start-session");
    return response.data;
  },

  chat: async ({ message, sessionId, conversationHistory = [] }) => {
    const response = await api.post("/gemini/chat", {
      message,
      sessionId,
      conversationHistory
    });
    return response.data;
  },

  chatWithImage: async ({ formData, sessionId }) => {
    const response = await api.post(`/gemini/chat-with-image/${sessionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  clear: async ({ sessionId }) => {
    const response = await api.post("/gemini/clear", {
      sessionId,
    });
    return response.data;
  },
};

