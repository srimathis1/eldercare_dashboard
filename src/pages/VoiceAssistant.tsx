import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const aiResponses: Record<string, string> = {
  medication: "Based on the current schedule, Margaret Johnson's next medication is Lisinopril 10mg due at 8:00 PM. She has been showing 97% compliance this week.",
  appointment: "The next appointment is a Routine Checkup with Dr. Sarah Williams tomorrow at 2:00 PM in Room 203 at Main Clinic.",
  health: "Margaret's latest vitals show heart rate at 72 bpm, blood pressure at 138/85 mmHg, and oxygen saturation at 97%. Blood pressure is slightly elevated — monitoring is recommended.",
  emergency: "Emergency protocol activated. Contacting Sarah Johnson (daughter) at +1 (555) 987-6543. Nearest hospital: Springfield General, 3.2 miles away.",
  default: "I'm your ElderCare AI assistant. You can ask me about medications, appointments, health status, or say 'emergency' for urgent assistance.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("medication") || lower.includes("medicine") || lower.includes("pill") || lower.includes("dose")) return aiResponses.medication;
  if (lower.includes("appointment") || lower.includes("doctor") || lower.includes("checkup") || lower.includes("visit")) return aiResponses.appointment;
  if (lower.includes("health") || lower.includes("vital") || lower.includes("heart") || lower.includes("blood") || lower.includes("oxygen")) return aiResponses.health;
  if (lower.includes("emergency") || lower.includes("help") || lower.includes("fall") || lower.includes("urgent")) return aiResponses.emergency;
  return aiResponses.default;
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleUserInput = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text, timestamp: new Date() };
    const response = getAIResponse(text);
    const aiMsg: Message = { role: "assistant", text: response, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setTranscript("");
    speak(response);
  }, [speak]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleUserInput("Tell me about the patient's health status");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const result = Array.from(event.results).map(r => r[0].transcript).join("");
      setTranscript(result);
      if (event.results[0].isFinal) {
        handleUserInput(result);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [handleUserInput]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleCall = () => {
    if (isInCall) {
      stopListening();
      window.speechSynthesis?.cancel();
      setIsInCall(false);
      setIsSpeaking(false);
    } else {
      setIsInCall(true);
      setMessages([]);
      const greeting = "Hello! I'm your ElderCare AI assistant. How can I help you today? You can ask about medications, appointments, health vitals, or say emergency for urgent help.";
      setMessages([{ role: "assistant", text: greeting, timestamp: new Date() }]);
      speak(greeting);
    }
  };

  return (
    <div>
      <div className="eldercare-card max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Voice Assistant</h1>
          </div>
          {isInCall && (
            <div className="flex items-center gap-2 text-sm">
              {isSpeaking && <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">In Call</span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6 min-h-[280px] max-h-[380px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Start a voice call to have a natural conversation with your AI companion</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Live transcript */}
        {transcript && (
          <div className="bg-accent/50 rounded-lg p-3 mb-4 text-sm">
            <span className="text-muted-foreground font-medium">Listening: </span>
            <span className="text-foreground">{transcript}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant={isInCall ? "destructive" : "default"}
              className="gap-2 px-8"
              onClick={toggleCall}
            >
              {isInCall ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              {isInCall ? "End Call" : "Start Voice Call"}
            </Button>

            {isInCall && (
              <Button
                size="lg"
                variant={isListening ? "secondary" : "outline"}
                className="gap-2"
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Speak
                  </>
                )}
              </Button>
            )}
          </div>

          {isInCall && (
            <p className="text-xs text-muted-foreground">
              Click "Speak" and ask about medications, appointments, health, or emergencies
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
