import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ImagePlus, X, Menu } from "lucide-react";
import SpaceBackground from "./components/SpaceBackground.tsx";
import ElectricThinking from "./components/ElectricThinking.tsx";
import WelcomeScreen from "./components/WelcomeScreen.tsx";
import SidePanel from "./components/SidePanel.tsx";
import { askMahoday } from "./lib/gemini.ts";
import {
  type ChatMessage,
  type ChatSession,
  newSessionId,
  getAllSessions,
  getSession,
  appendMessage,
  deleteSession,
} from "./lib/storage.ts";

// Minimal SpeechRecognition typing so TS doesn't complain (not in default lib.dom.d.ts everywhere)
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => newSessionId());

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(URL.createObjectURL(file));
      const result = reader.result as string;
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openPanel = () => {
    setSessions(getAllSessions());
    setPanelOpen(true);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(newSessionId());
    setPanelOpen(false);
  };

  const handleSelectSession = (id: string) => {
    const session = getSession(id);
    setMessages(session ? session.messages : []);
    setSessionId(id);
    setPanelOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(getAllSessions());
    if (id === sessionId) {
      setMessages([]);
      setSessionId(newSessionId());
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !imageBase64) || thinking) return;

    const userMsg: ChatMessage = { role: "user", content: text, image: imagePreview };
    setMessages((prev) => [...prev, userMsg]);
    appendMessage(sessionId, { role: "user", content: text || "[image]", image: imagePreview });

    const sentImage = imageBase64;
    setInput("");
    clearImage();
    setThinking(true);

    try {
      const reply = await askMahoday(text, sentImage);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      appendMessage(sessionId, { role: "assistant", content: reply });
    } catch {
      const fallback = "Something went wrong reaching Gemini. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
      appendMessage(sessionId, { role: "assistant", content: fallback });
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="relative w-full h-dvh text-white flex flex-col font-sans">
      <div className="absolute inset-0">
        <SpaceBackground />
      </div>

      <div className="relative z-20 flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-lg font-semibold tracking-wide">Mahoday</h1>
          <p className="text-[11px] text-slate-400 -mt-0.5">Local test build - no backend</p>
        </div>
        <button
          onClick={openPanel}
          className="ml-auto w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 px-4 py-2 text-center shrink-0">
        <p className="text-sm font-medium text-slate-200">Mahoday - AI Assistant of SRIMT</p>
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600/80 rounded-br-sm"
                    : "bg-white/10 border border-white/10 rounded-bl-sm backdrop-blur-sm"
                }`}
              >
                {m.image && (
                  <img src={m.image} alt="upload" className="rounded-lg mb-2 max-h-40 object-cover" />
                )}
                {m.content}
              </div>
            </div>
          ))
        )}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <ElectricThinking />
            </div>
          </div>
        )}
      </div>

      {imagePreview && (
        <div className="relative z-10 px-4 pb-2 shrink-0">
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-16 rounded-lg border border-white/20" />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-20 px-3 py-3 border-t border-white/10 bg-black/40 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-500"
          />

          <button
            onClick={toggleVoice}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              listening ? "bg-red-500/80 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSend}
            disabled={thinking}
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <SidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sessions={sessions}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
