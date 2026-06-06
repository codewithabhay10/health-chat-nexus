import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Send, Mic, MicOff, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { multiLingual } from "@/utils/translation";
import testdata from "./testdata.json"

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isProcessing?: boolean;
  suggestions?: string[];
  doctorReferral?: {
    condition: string;
    specialtyNeeded: string;
  };
}

type BookingStep = null | "date" | "time" | "address"

const languageCodeMap: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Punjabi: "pa",
  Telugu: "te",
  Tamil: "ta",
  Gujarati: "gu",
  Bengali: "bn",
};

// Play TTS in a specific language using backend-generated mp3
async function playTTS(text: string, language: string) {
  const res = await fetch("https://database-tval.onrender.com/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }), // send both
  });
  const { file_id } = await res.json();

  const audioRes = await fetch(`https://database-tval.onrender.com/tts/${file_id}`);
  const audioBlob = await audioRes.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

async function Chat(prompt: string) {
  const response = await fetch("https://database-tval.onrender.com/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error("Failed to get response from AI");
  const data = await response.json();
  return data.text;
}

async function getIntent(text:string) {
  const response = await fetch("https://database-tval.onrender.com/detect_intent/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("Failed to get response from AI");
  const data = await response.json();
  console.log(data);
  return data.intent;
}

const defaultTexts = {
  welcome: "Hi there! Please describe your symptoms or any lab test or doctor appoitments you want to book.",
  placeholder: "Describe your symptoms...",
  powered: "Powered by Google Gemini",
  aiLabel: "AI Health Assistant",
  info: "AI assistant provides general information only. Always consult with a healthcare provider for medical advice.",
  suggestions: [
    "I have a headache",
    "My throat is sore",
    "I have a fever",
    "My skin has a rash"
  ]
};

const MedicalChatbot = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [uiTexts, setUiTexts] = useState(defaultTexts);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: defaultTexts.welcome,
      sender: "bot",
      timestamp: new Date(),
      suggestions: defaultTexts.suggestions
    }
  ]);

  const [selectableTests, setSelectableTests] = useState<any[]>([]);
  const [pendingTest, setPendingTest] = useState<any | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>(null);
  const [bookingInfo, setBookingInfo] = useState<{ date?: string; time?: string; address?: string }>({});

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  let userData = "";

  // Translate all UI texts when language changes
  useEffect(() => {
    async function translateUI() {
      const translatedWelcome = await multiLingual(language, defaultTexts.welcome);
      const translatedPlaceholder = await multiLingual(language, defaultTexts.placeholder);
      const translatedPowered = await multiLingual(language, defaultTexts.powered);
      const translatedAiLabel = await multiLingual(language, defaultTexts.aiLabel);
      const translatedInfo = await multiLingual(language, defaultTexts.info);
      const translatedSuggestions = await Promise.all(
        defaultTexts.suggestions.map(s => multiLingual(language, s))
      );
      setUiTexts({
        welcome: translatedWelcome,
        placeholder: translatedPlaceholder,
        powered: translatedPowered,
        aiLabel: translatedAiLabel,
        info: translatedInfo,
        suggestions: translatedSuggestions
      });
      // Update the welcome message in messages
      setMessages((prev) => [
        {
          ...prev[0],
          text: translatedWelcome,
          suggestions: translatedSuggestions
        },
        ...prev.slice(1)
      ]);
    }
    translateUI();
  }, [language]);

  const handleMicClick = async () => {
    if (!isRecording) {
      setAudioUrl(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunks.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const response = await fetch("https://database-tval.onrender.com/record", {
              method: "POST",
              headers: {
                "Accept": "application/json",
              },
              body: formData,
            });

            if (response.ok) {
              toast({
                title: "Upload complete",
                description: "Audio uploaded to the server.",
              });
              const data = await response.json();
              // Optionally translate the transcript
              let translated = await multiLingual(language, data.transcription);
              setInput(translated);
              toast({
                title: "Transcription complete",
                description: "You can edit the text before sending.",
              });
              setAudioUrl(null);
            } else {
              toast({
                title: "Upload failed",
                description: "Could not upload audio to the server.",
                variant: "destructive",
              });
            }
          } catch (err) {
            toast({
              title: "Upload error",
              description: "An error occurred while uploading.",
              variant: "destructive",
            });
          }
        };
        mediaRecorder.start();
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Speak clearly to record your message."
        });
      } catch (err) {
        toast({
          title: "Microphone Error",
          description: "Could not access microphone.",
          variant: "destructive"
        });
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageToSend = input.trim();
    if (messageToSend === "") return;

    if (pendingTest && bookingStep) {
  // Add user's input as a message first
  setMessages(prev => [
    ...prev,
    {
      id: Date.now() + Math.random(),
      text: input,
      sender: "user",
      timestamp: new Date()
    }
  ]);

  if (bookingStep === "date") {
    setBookingInfo(prev => ({ ...prev, date: input }));
    setBookingStep("time");
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: "Please enter your preferred time (e.g., 10:00 AM):",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }, 100);
    setInput("");
    return;
  }
  if (bookingStep === "time") {
    setBookingInfo(prev => ({ ...prev, time: input }));
    setBookingStep("address");
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: "Please enter your address for sample pickup:",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }, 100);
    setInput("");
    return;
  }
  if (bookingStep === "address") {
    const finalBooking = {
      date: bookingInfo.date,
      time: bookingInfo.time,
      address: input
    };
    setBookingInfo({});
    setBookingStep(null);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: "Thank you! Booking your test...",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }, 100);

    // POST to backend (as before)
    fetch("https://database-tval.onrender.com/test/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        test_id: pendingTest.id || pendingTest._id || "",
        user_id: localStorage.getItem("userId") || "demo-user",
        date: finalBooking.date,
        time: finalBooking.time,
        address: finalBooking.address,
        status: "sheduled",
      })
    }).then(() => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: `Your test "${pendingTest.name}" has been booked for ${finalBooking.date} at ${finalBooking.time}.`,
            sender: "bot",
            timestamp: new Date()
          }
        ]);
        setPendingTest(null);
      }, 100);
    }).catch(() => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: "Sorry, there was an error booking your test. Please try again.",
            sender: "bot",
            timestamp: new Date()
          }
        ]);
        setPendingTest(null);
      }, 100);
    });
    setInput("");
    return;
  }
}

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: messageToSend,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const intent = await getIntent(messageToSend);
      if (intent === "diagnosis"){
        const aiText = await Chat(messageToSend + " " + userData);
        const translatedAiText = await multiLingual(language, aiText);
        const aiMessage: Message = {
          id: userMessage.id + 1,
          text: translatedAiText,
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await playTTS(translatedAiText, languageCodeMap[language] || "en"); // Use language code
      } if (intent == "test"){
        let foundTests: any[] = [];
          testdata["all data"].forEach((item: any) => {
            Object.keys(item).forEach((key) => {
              if (input.toLowerCase().includes(key.toLowerCase())) {
                item[key].forEach((test: any) => {
                  foundTests.push({ ...test, category: key });
                });
              }
            });
          });

      const translatedText = await multiLingual(language, "Here are the tests I found:");

    if (foundTests.length > 0) {
      setSelectableTests(foundTests);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: translatedText,
          sender: "bot",
          timestamp: new Date()
        }
      ]);
      setInput("");
      await playTTS(translatedText, languageCodeMap[language] || "en");
      return;
    }
      }
    } catch (err) {
      toast({
        title: "AI Error",
        description: "Failed to get a response from the AI.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const renderTestSelection = () => (
    selectableTests.length > 0 && (
      <div className="mb-4 flex flex-wrap gap-2">
        {selectableTests.map((test, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => {
              setPendingTest(test);
              setSelectableTests([]);
              setBookingStep("date");
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now() + Math.random(),
                  text:
                    `You selected "${test.name}".\nDescription: ${test.description || "N/A"}\nPrice: ${test.cost || test.price || "N/A"}\n\nPlease enter your preferred date (YYYY-MM-DD):`,
                  sender: "bot",
                  timestamp: new Date()
                }
              ]);
            }}
          >
            {test.name}
          </Button>
        ))}
      </div>
    )
  );

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] overflow-hidden rounded-lg shadow-md bg-white">
      <div className="bg-health-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h2 className="font-semibold">{uiTexts.aiLabel}</h2>
        </div>
        <div className="text-xs bg-health-500 px-2 py-1 rounded-full">
          {uiTexts.powered}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`
                  max-w-[80%] rounded-lg p-3
                  ${message.sender === "user" 
                    ? "bg-health-100 text-gray-800" 
                    : "bg-white border border-gray-200 shadow-sm"}
                `}
              >
                <div className="flex items-start gap-2">
                  {message.sender === "bot" && (
                    <Bot className="h-5 w-5 mt-1 text-health-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium">
                        {message.sender === "user" ? "You" : uiTexts.aiLabel}
                      </div>
                      <div className="text-xs text-gray-400 ml-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p className="mt-1 text-sm">{message.text}</p>
                  </div>
                </div>
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
          {renderTestSelection()}
        </div>
      </div>
      
      <form className="border-t p-3" onSubmit={handleSendMessage}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isRecording ? 'bg-red-100 text-red-500' : ''}`}
            onClick={handleMicClick}
            type="button"
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={uiTexts.placeholder}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-health-500"
            disabled={isTyping}
          />
          <Button 
            size="sm"
            className="rounded-full"
            type="submit"
            disabled={isTyping || input.trim() === ''}
            onClick={() => { userData += input; }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 px-2">
          <p className="text-xs text-gray-400 flex items-center">
            <Brain className="h-3 w-3 mr-1" />
            {uiTexts.info}
          </p>
        </div>
      </form>
    </div>
  );
};

export default MedicalChatbot;