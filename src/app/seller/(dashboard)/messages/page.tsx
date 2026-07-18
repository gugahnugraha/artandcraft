"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Send, User, Loader2 } from "lucide-react";

export default function SellerMessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("id");

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(targetConvId);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      const data = await res.json();
      if (res.ok && data.conversations) {
        setConversations(data.conversations);
        if (!activeConvId && data.conversations.length > 0) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId: string, showLoader = false) => {
    if (showLoader) setIsLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages/${convId}`);
      const data = await res.json();
      if (res.ok) {
        setActiveConversation(data.conversation);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setIsLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (targetConvId) {
      setActiveConvId(targetConvId);
    }
  }, [targetConvId]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId, true);
      const interval = setInterval(() => {
        fetchMessages(activeConvId, false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const res = await fetch(`/api/messages/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!session) return null;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Pesan Masuk (Diskusi Pembeli)
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tanggapi pertanyaan calon pembeli dengan cepat untuk meningkatkan konversi penjualan.
        </p>
      </div>

      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex shadow-sm">
        {/* Left: Conversation List */}
        <div className="w-full sm:w-80 border-r border-border flex flex-col shrink-0 bg-muted/10">
          <div className="p-4 border-b border-border font-semibold text-sm text-foreground">
            Daftar Pembeli
          </div>

          {isLoadingConvs ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs">Belum ada pesan dari pembeli.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const lastMsg = conv.messages[0]?.text || "Percakapan dimulai";
                const buyerName = conv.buyer.name || "Pembeli";

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                      isActive ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {buyerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{buyerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{lastMsg}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Messages Area */}
        <div className="hidden sm:flex flex-1 flex-col h-full bg-background">
          {activeConvId && activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3 bg-card shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                  {activeConversation.buyer.name?.charAt(0) || "P"}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {activeConversation.buyer.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{activeConversation.buyer.email}</p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {isLoadingMsgs ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    Belum ada pesan.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === session.user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-card border border-border text-foreground rounded-bl-none"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik balasan untuk pembeli..."
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Kirim</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-semibold text-sm">Pilih pembeli dari daftar di sebelah kiri</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
