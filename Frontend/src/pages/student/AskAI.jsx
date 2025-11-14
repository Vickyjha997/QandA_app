import React, { useEffect, useRef, useState } from "react";
import { geminiService } from "../../services/geminiService";
import { Send, Loader, Sparkles, Image as ImageIcon, X, Trash } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export const AskAI = () => {
  const [messages, setMessages] = useState([]); // { role, text, imageLocal (dataURL or BASE_URL+path) }
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const fileInputRef = useRef();
  const bottomRef = useRef();

  // on mount: start session
  useEffect(() => {
    (async () => {
      try {
        const res = await geminiService.startSession();
        if (res.success && res.sessionId) {
          setSessionId(res.sessionId);
        } else {
          toast.error("Failed to start session");
        }
      } catch (e) {
        toast.error("Session error");
        console.error(e);
      }
    })();

    // cleanup object URLs on unmount
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line
  }, []);

  // auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendText = async () => {
    if (!input.trim()) return;
    if (!sessionId) {
      toast.error("No session");
      return;
    }

    const userMsg = { role: "user", text: input, image: imagePreview ? imagePreview : null, timestamp: new Date().toISOString() };

    // optimistic UI
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      // Send conversation history to backend as frontend knows it
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        text: m.text,
        image: m.imageLocal || m.image || null,
      }));

      const resp = await geminiService.chat({
        message: input,
        sessionId,
        conversationHistory,
      });

      if (!resp.success) {
        throw new Error(resp.message || "AI error");
      }

      // append model response
      const modelMsg = { role: "model", text: resp.response, timestamp: new Date().toISOString() };
      setMessages((p) => {
        // previous optimistic user msg already added - replace by appending model
        return [...p, modelMsg];
      });

      // clear input and image preview/file only after success
      setInput("");
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI response");
      // remove optimistic user message (optional). Here we keep the message but you can remove it.
    } finally {
      setLoading(false);
    }
  };

  const sendWithImage = async () => {
    if (!sessionId) {
      toast.error("No session");
      return;
    }
    if (!imageFile && !input.trim()) return;

    const userMsg = { role: "user", text: input, imageLocal: imagePreview, timestamp: new Date().toISOString() };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", input);
      if (imageFile) formData.append("image", imageFile);
      // send conversationHistory for context (frontend state)
      formData.append(
        "conversationHistory",
        JSON.stringify(
          messages.map((m) => ({
            role: m.role,
            text: m.text,
            image: m.imageLocal || m.image || null,
          }))
        )
      );

      const resp = await geminiService.chatWithImage({ formData, sessionId });
      if (!resp.success) {
        throw new Error(resp.message || "AI vision error");
      }

      // model reply; resp.imagePath gives the backend stored path (e.g. /uploads/...)
      const modelMsg = { role: "model", text: resp.response, timestamp: new Date().toISOString() };
      setMessages((p) => [...p, modelMsg]);

      // Replace last user optimistic message's imageLocal with server-provided image path so that
      // if page remains the same the image will be served by server (optional).
      // We'll keep local preview for immediate display; backend path is available in resp.imagePath.
      // You could swap to backend-hosted image by updating messages array; for now we'll keep preview.

      setInput("");
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (imageFile) await sendWithImage();
    else await sendText();
     if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const preview = URL.createObjectURL(f);
    setImagePreview(preview);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearChat = async () => {
    if (!sessionId) return;
    const conf = window.confirm("Clear chat and delete session files?");
    if (!conf) return;
    try {
      const resp = await geminiService.clear({ sessionId });
      if (resp.success) {
        setMessages([]);
        // start a fresh session to ensure server deletes old session and creates new
        const s = await geminiService.startSession();
        if (s.success) setSessionId(s.sessionId);
      } else {
        toast.error("Failed to clear chat");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear chat");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 py-8 h-[calc(100vh-6rem)]">
      <div className="bg-white rounded-xl flex flex-col shadow-lg border border-primary-100 h-full">
        <div className="border-b pb-4 mb-4 px-6 pt-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center text-primary-700">
              <Sparkles className="h-6 w-6 mr-2 text-primary-700" />
              AI Assistant
            </h1>
            <p className="text-gray-600 text-sm">Ask about studies. Attach an image if needed.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearChat}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100"
            >
              <Trash className="w-4 h-4" /> Clear Chat
            </button>
            <div className="text-xs text-gray-400">Session: {sessionId ? sessionId.slice(-6) : "—"}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">Start a conversation with the AI</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-4 rounded-lg shadow
                  ${m.role === "user" ? "bg-primary-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}
                `}
              >
                {m.imageLocal && (
                  <img src={m.imageLocal} alt="attachment" className="mb-2 rounded max-h-40 object-contain border" />
                )}
                {/* m.imageLocal is local preview blob URL; if you want to use server path, store it in message.image */}
                {m.role === "model" ? (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                ) : (
                  <p>{m.text}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-lg">
                <Loader className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t pt-4 px-4 pb-6 bg-gray-50">
          {imagePreview && (
            <div className="mb-2 p-2 bg-white rounded flex items-center justify-between border">
              <span className="text-sm text-gray-600 flex items-center">
                <img src={imagePreview} alt="preview" className="h-8 w-8 rounded mr-2 object-cover border" />
                {imageFile?.name}
              </span>
              <button type="button" onClick={removeImage} className="text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={onImageChange} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="bg-white border rounded p-2 flex items-center cursor-pointer hover:bg-gray-100">
              <ImageIcon className="h-5 w-5 text-gray-600" />
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or attach an image..."
              className="input flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !imageFile)}
              className="btn-primary px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center transition"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskAI;
