import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import { useChatBot } from "@/hooks/useChatBot";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "Help me find opportunities", icon: "🔍" },
  { label: "How do I use the tracker?", icon: "📊" },
  { label: "Tips for contacting hospitals", icon: "📞" },
  { label: "What should I include in my application?", icon: "📝" },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages } = useChatBot();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]",
          "bg-background border border-border rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0 h-[550px] max-h-[calc(100vh-3rem)]"
            : "opacity-0 translate-y-4 h-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Clinical Connect Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Sparkles className="w-10 h-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">
                  Hi! I'm here to help
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about finding clinical opportunities or using the platform.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Quick questions
                </p>
                <div className="grid gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label)}
                      className="flex items-center gap-2 p-3 text-left text-sm rounded-xl
                        bg-muted/50 hover:bg-muted border border-border/50
                        transition-colors duration-200"
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={isLoading}
              className="flex-1 rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="rounded-xl shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
