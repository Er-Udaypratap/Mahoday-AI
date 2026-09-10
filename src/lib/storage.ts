// Purely local chat history - no backend, no Supabase. Everything lives in
// localStorage under one key, keyed by session id.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = "mahoday_test_sessions";

function readAll(): Record<string, ChatSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ChatSession>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function newSessionId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAllSessions(): ChatSession[] {
  const all = readAll();
  return Object.values(all).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSession(id: string): ChatSession | null {
  const all = readAll();
  return all[id] ?? null;
}

export function appendMessage(sessionId: string, message: ChatMessage) {
  const all = readAll();
  if (!all[sessionId]) {
    all[sessionId] = {
      id: sessionId,
      title: message.role === "user" ? message.content || "New chat" : "New chat",
      createdAt: new Date().toISOString(),
      messages: [],
    };
  }
  all[sessionId].messages.push(message);
  all[sessionId].createdAt = new Date().toISOString();
  writeAll(all);
}

export function deleteSession(id: string) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}
