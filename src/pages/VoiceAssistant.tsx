import { Mic, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoiceAssistant = () => {
  return (
    <div>
      <div className="eldercare-card max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Mic className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Voice Assistant</h1>
        </div>

        <div className="flex flex-col items-center py-12">
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
            <Mic className="w-12 h-12 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Ready to Call</span>
          </div>

          <Button className="gap-2 px-6">
            <Phone className="w-4 h-4" />
            Start Voice Call
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Start a voice call to have a natural conversation with your AI companion
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
