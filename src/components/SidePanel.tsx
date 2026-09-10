import React from "react";
import { X, Shield, Trash2 } from "lucide-react";
import type { ChatSession } from "../lib/storage";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function SidePanel({
  open,
  onClose,
  sessions,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <div
        className={`fixed top-0 right-0 h-dvh w-[82%] max-w-xs bg-[#0b0c24] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <p className="text-base font-semibold">Mahoday (Test build)</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pt-4 space-y-2">
          <button
            onClick={() =>
              alert(
                "This is a local test build. Chat history is stored only in this browser's local storage - nothing is sent to a server or database."
              )
            }
            className="w-full flex items-center gap-2 justify-center border border-white/20 rounded-lg py-2.5 text-sm text-slate-200 hover:bg-white/5"
          >
            <Shield className="w-4 h-4" />
            Privacy note
          </button>

          <button
            onClick={onNewChat}
            className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-lg py-2.5 text-sm font-medium"
          >
            + New chat
          </button>
        </div>

        <p className="px-4 pt-5 pb-2 text-xs font-medium text-slate-500 tracking-wide">
          CHATS (stored on this device)
        </p>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {sessions.length === 0 && (
            <p className="px-2 text-xs text-slate-500">No previous chats yet.</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2.5"
            >
              <button onClick={() => onSelectSession(s.id)} className="flex-1 text-left min-w-0">
                <p className="text-sm truncate">{s.title}</p>
                <p className="text-[11px] text-slate-500">{timeAgo(s.createdAt)}</p>
              </button>
              <button
                onClick={() => onDeleteSession(s.id)}
                className="text-slate-500 hover:text-red-400 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
