import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGlobalAIChatConfig } from "@/hooks/use-ai-chat-config";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  chat_id: string;
  answer: string;
}

const Chat = () => {
  const { user, loading: authLoading, roleCheckComplete } = useAuth();
  const { chatConfig, loading: configLoading, error: configError } = useGlobalAIChatConfig();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && roleCheckComplete && !configLoading) {
      if (!user) {
        navigate("/");
      } else if (configError) {
        toast({
          title: "Configuration Error",
          description: "AI chat settings could not be loaded. Please contact an administrator.",
          variant: "destructive",
        });
      }
    }
  }, [user, authLoading, configLoading, roleCheckComplete, configError, navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatConfig?.base_url || chatConfig.temperature == null) {
      if (!chatConfig?.base_url || chatConfig.temperature == null) {
        toast({
          title: "Configuration Missing",
          description: "AI chat configuration is not properly set up.",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const url = new URL(`${chatConfig.base_url}/chat`);
      url.searchParams.append("query", inputMessage);
      url.searchParams.append("temperature", chatConfig.temperature.toString());
      if (chatId) url.searchParams.append("chat_id", chatId);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: "",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      setChatId(data.chat_id);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please check your chat configuration or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setChatId(null);
  };

  if (authLoading || configLoading || !roleCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isChatDisabled = !chatConfig?.base_url || chatConfig.temperature == null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-150px)] flex flex-col backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-white/20 bg-white/30 backdrop-blur-sm">
            <CardTitle className="flex items-center gap-3 text-2xl text-blue-800 font-semibold">
              <MessageCircle className="w-6 h-6" />
              AI Chat Assistant
            </CardTitle>
            <div className="mt-2 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
              {isChatDisabled && (
                <div className="text-sm text-amber-600 font-medium">
                  ⚠️ Chat configuration required
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  {isChatDisabled ? (
                    <>
                      <p className="text-lg mb-2">Chat Configuration Required</p>
                      <p className="text-sm">Please configure the AI chat settings to start chatting.</p>
                    </>
                  ) : (
                    <p className="text-lg">Start a conversation with the AI assistant!</p>
                  )}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex max-w-[80%] gap-3">
                      <div
                        className={`rounded-xl p-3 transition-all ${
                          message.isUser
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white self-end shadow-md"
                            : "bg-white text-gray-900 shadow border border-gray-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        <p className="text-[11px] text-right mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isChatDisabled ? "Chat configuration required..." : "Type your message..."}
                disabled={isLoading || isChatDisabled}
                className="flex-1 rounded-full px-4 py-2 shadow-inner bg-white/90"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || isChatDisabled}
                className="rounded-full h-10 w-10 p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
