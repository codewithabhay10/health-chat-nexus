import React, { useState, useEffect, useRef } from "react";
import GlassCard from "./ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Globe, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoogleGenAI } from "@google/genai";

const model_key = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
if (!model_key) {
  throw new Error("API key is not set. Please set the GOOGLE_GENAI_API_KEY environment variable.");
}

let newResponse = "Waiting for response...";

const ai = new GoogleGenAI({ apiKey: model_key });

async function Chat(question: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Given the question, answer only when the question is asked about the symptoms of a disease and you may suggest home remedies to ease the symptoms. Otherwise, answer in a friendly manner asking them to login or signup to continue. Question is: " + question,
          },
        ],
      },
    ],
  });

  // Wait until result.text is available
  while (!result || !result.text) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  newResponse = result.text;
  }
  newResponse = result.text;
  return newResponse;
}



async function multiLingual(language: string, text: string) {
  try {
    const response = await fetch(`https://database-tval.onrender.com/${language.toLowerCase()}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    const data = await response.json();
    console.log(data);
    return data["Translation"];
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text
  }
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  language?: string;
}

const ChatbotDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help with your health questions today?",
      sender: "bot"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const languages = ["English", "Hindi", "Gujarati", "Tamil", "Telugu", "Bengali", "Punjabi"];
  
  // Update greeting when language changes
  useEffect(() => {
    const updateGreeting = async () => {
      if (currentLanguage !== "English") {
        const translatedGreeting = await multiLingual(
          currentLanguage.toLowerCase(),
          "Hello! How can I help with your health questions today?"
        );
        
        setMessages([
          {
            id: 1,
            text: translatedGreeting || "Hello! How can I help with your health questions today?",
            sender: "bot",
            language: currentLanguage
          }
        ]);
      } else {
        setMessages([
          {
            id: 1,
            text: "Hello! How can I help with your health questions today?",
            sender: "bot"
          }
        ]);
      }
    };
    
    updateGreeting();
  }, [currentLanguage]);

  const handleSendMessage = async (e?: React.FormEvent) => {
  e?.preventDefault();

  if (!inputValue.trim()) return;

  // Add user message
  const newMessage: Message = {
    id: messages.length + 1,
    text: inputValue,
    sender: "user",
  };

  setMessages([...messages, newMessage]);
  setInputValue("");
  setIsTyping(true);

  // Get AI response
  const aiResponse = await Chat(inputValue);

  // Translate AI response if needed
  const responseText = await multiLingual(currentLanguage.toLowerCase(), aiResponse);

  const botMessage: Message = {
    id: messages.length + 2,
    text: responseText,
    sender: "bot",
    language: currentLanguage
  };

  setMessages(prevMessages => [...prevMessages, botMessage]);
  setIsTyping(false);
};

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
  };

  return (
    <section className="py-20 px-6 relative">
      <div className="absolute top-40 left-0 w-96 h-96 bg-health-50 rounded-full filter blur-3xl opacity-50 -z-10 " id = "demo"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience Our <span className="text-gradient">Multilingual Chatbot</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Try our AI healthcare assistant in different languages.
            Get accurate health information no matter what language you speak.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 animate-on-scroll">
            <GlassCard className="p-0 overflow-hidden h-[500px] flex flex-col">
              <div className="bg-health-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">HealthChat Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{currentLanguage}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-health-600 text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="w-100">{message.text}</p>
                      {message.language && message.sender === "bot" && (
                        <p className="text-xs mt-1 opacity-70">
                          Responding in {message.language}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => {
                  setInputValue(e.target.value);
                  }}
                  placeholder="Type your health question..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
                </form>
            </GlassCard>
          </div>
          
          <div className="w-full lg:w-1/2 space-y-8 animate-on-scroll">
            <h3 className="text-2xl font-bold">
              Select a Language
            </h3>
            
            <p className="text-muted-foreground">
              "Please select your preferred language to get personalized health information."
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {languages.map((language) => (
                <Button
                  key={language}
                  variant={currentLanguage === language ? "default" : "outline"}
                  className={`rounded-full ${
                    currentLanguage === language
                      ? ""
                      : "hover:bg-health-50 hover:text-health-700 hover:border-health-200"
                  }`}
                  onClick={() => changeLanguage(language)}
                >
                  {language}
                </Button>
              ))}
            </div>
            
            <div className="p-4 bg-health-50 border border-health-100 rounded-lg">
              <h4 className="font-medium mb-2">Try asking:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>"What could be causing my headache?"</li>
                <li>"What could be the possible symptoms malaria"</li>
                <li>"How can I manage my allergies naturally?"</li>
                <li>"What are the symptoms of dehydration?"</li>
                <li>"Should I be worried about this rash?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotDemo;
