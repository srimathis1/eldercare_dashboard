import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useRef, useCallback, useEffect } from "react";

type AssistantState = "idle" | "listening" | "processing" | "speaking";

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const aiResponses: Record<string, string> = {
  medication:
    "Based on the current schedule, Margaret Johnson's next medication is Lisinopril 10mg due at 8:00 PM. She has been showing 97% compliance this week.",
  appointment:
    "The next appointment is a Routine Checkup with Dr. Sarah Williams tomorrow at 2:00 PM in Room 203 at Main Clinic.",
  health:
    "Margaret's latest vitals show heart rate at 72 bpm, blood pressure at 138/85 mmHg, and oxygen saturation at 97%. Blood pressure is slightly elevated — monitoring is recommended.",
  emergency:
    "Emergency protocol activated. Contacting Sarah Johnson (daughter) at +1 (555) 987-6543. Nearest hospital: Springfield General, 3.2 miles away.",
  default:
    "I'm your ElderCare AI assistant. You can ask me about medications, appointments, health status, or say 'emergency' for urgent assistance.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("medication") || lower.includes("medicine") || lower.includes("pill") || lower.includes("dose"))
    return aiResponses.medication;
  if (lower.includes("appointment") || lower.includes("doctor") || lower.includes("checkup") || lower.includes("visit"))
    return aiResponses.appointment;
  if (lower.includes("health") || lower.includes("vital") || lower.includes("heart") || lower.includes("blood") || lower.includes("oxygen"))
    return aiResponses.health;
  if (lower.includes("emergency") || lower.includes("help") || lower.includes("fall") || lower.includes("urgent"))
    return aiResponses.emergency;
  return aiResponses.default;
}

const STATUS_LABELS: Record<AssistantState, string> = {
  idle: "Ready",
  listening: "Listening...",
  processing: "Processing...",
  speaking: "Speaking...",
};

const VoiceAssistant = () => {
  const [state, setState] = useState<AssistantState>("idle");
  const [isInCall, setIsInCall] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldContinueRef = useRef(false);
  const stoppedManuallyRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string): Promise<void> =>
      new Promise((resolve) => {
        if (!("speechSynthesis" in window)) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();
        setState("speaking");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onend = () => {
          setState("idle");
          resolve();
        };
        utterance.onerror = () => {
          setState("idle");
          resolve();
        };
        window.speechSynthesis.speak(utterance);
      }),
    []
  );

  const startListening = useCallback(() => {
    if (stoppedManuallyRef.current) return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      // Fallback for browsers without speech recognition
      const fallback = "Tell me about the patient's health status";
      const response = getAIResponse(fallback);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: fallback, timestamp: new Date() },
        { role: "assistant", text: response, timestamp: new Date() },
      ]);
      speak(response);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(result);

      if (event.results[0].isFinal) {
        setState("processing");
        const response = getAIResponse(result);
        setMessages((prev) => [
          ...prev,
          { role: "user", text: result, timestamp: new Date() },
          { role: "assistant", text: response, timestamp: new Date() },
        ]);
        setTranscript("");

        // Speak response, then optionally restart listening
        speak(response).then(() => {
          if (shouldContinueRef.current && continuousMode && !stoppedManuallyRef.current) {
            setTimeout(() => {
              if (shouldContinueRef.current && !stoppedManuallyRef.current) {
                startListening();
              }
            }, 600);
          }
        });
      }
    };

    recognition.onerror = () => {
      if (!stoppedManuallyRef.current && shouldContinueRef.current && continuousMode) {
        setTimeout(() => {
          if (shouldContinueRef.current && !stoppedManuallyRef.current) {
            startListening();
          }
        }, 800);
      } else {
        setState("idle");
      }
    };

    recognition.onend = () => {
      // Only update state if we haven't already transitioned to processing/speaking
      setState((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
  }, [speak, continuousMode]);

  const stopEverything = useCallback(() => {
    stoppedManuallyRef.current = true;
    shouldContinueRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    window.speechSynthesis?.cancel();
    setState("idle");
    setTranscript("");
  }, []);

  const handleStartConversation = useCallback(() => {
    stoppedManuallyRef.current = false;
    shouldContinueRef.current = true;
    startListening();
  }, [startListening]);

  const toggleCall = () => {
    if (isInCall) {
      stopEverything();
      setIsInCall(false);
    } else {
      setIsInCall(true);
      setMessages([]);
      stoppedManuallyRef.current = false;
      const greeting =
        "Hello! I'm your ElderCare AI assistant. How can I help you today? You can ask about medications, appointments, health vitals, or say emergency for urgent help.";
      setMessages([{ role: "assistant", text: greeting, timestamp: new Date() }]);
      speak(greeting);
    }
  };

  const stateColor: Record<AssistantState, string> = {
    idle: "bg-muted-foreground",
    listening: "bg-success",
    processing: "bg-warning",
    speaking: "bg-primary",
  };

  return (
    <div>
      <div className="eldercare-card max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Voice Assistant</h1>
          </div>
          {isInCall && (
            <div className="flex items-center gap-2 text-sm">
              {state === "speaking" && (
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              )}
              {state === "processing" && (
                <Loader2 className="w-4 h-4 text-warning animate-spin" />
              )}
              <span className={`w-2 h-2 rounded-full ${stateColor[state]} animate-pulse`} />
              <span className="text-muted-foreground">{STATUS_LABELS[state]}</span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6 min-h-[280px] max-h-[380px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  state === "listening"
                    ? "bg-primary/20 ring-4 ring-primary/30 animate-pulse"
                    : "bg-muted"
                }`}
              >
                <Mic
                  className={`w-8 h-8 ${
                    state === "listening" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Start a voice call to have a natural conversation with your AI companion
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
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

        {/* Continuous mode toggle */}
        {isInCall && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Switch
              id="continuous-mode"
              checked={continuousMode}
              onCheckedChange={setContinuousMode}
            />
            <Label htmlFor="continuous-mode" className="text-sm text-muted-foreground cursor-pointer">
              Continuous conversation mode
            </Label>
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

            {isInCall && state === "idle" && (
              <Button size="lg" variant="outline" className="gap-2" onClick={handleStartConversation}>
                <Mic className="w-5 h-5" />
                Start Listening
              </Button>
            )}

            {isInCall && (state === "listening" || state === "processing" || state === "speaking") && (
              <Button size="lg" variant="secondary" className="gap-2" onClick={stopEverything}>
                <MicOff className="w-5 h-5" />
                Stop
              </Button>
            )}
          </div>

          {isInCall && (
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              {continuousMode
                ? "Continuous mode: assistant will keep listening after each response until you stop"
                : "Click \"Start Listening\" each time you want to speak"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
