import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, ScanText, X, Check, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

interface ParsedMed {
  name: string;
  dosage: string;
  timing: string;
  instructions: string;
}

interface PrescriptionScannerProps {
  onMedicationsDetected: (meds: ParsedMed[]) => void;
}

// Common medication names for matching
const KNOWN_MEDS = [
  "lisinopril", "metformin", "aspirin", "atorvastatin", "amlodipine",
  "omeprazole", "losartan", "metoprolol", "albuterol", "gabapentin",
  "hydrochlorothiazide", "sertraline", "simvastatin", "montelukast",
  "escitalopram", "levothyroxine", "pantoprazole", "furosemide",
  "prednisone", "amoxicillin", "azithromycin", "ibuprofen",
  "acetaminophen", "paracetamol", "clopidogrel", "warfarin",
  "insulin", "glimepiride", "sitagliptin", "rosuvastatin",
  "cetirizine", "ranitidine", "diclofenac", "naproxen",
  "ciprofloxacin", "doxycycline", "fluoxetine", "citalopram",
  "venlafaxine", "duloxetine", "tramadol", "morphine",
  "hydrocodone", "oxycodone", "alprazolam", "lorazepam",
  "diazepam", "clonazepam", "zolpidem", "trazodone",
];

function parseMedicationsFromText(text: string): ParsedMed[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const meds: ParsedMed[] = [];

  // Dosage pattern
  const dosageRegex = /(\d+\.?\d*)\s*(mg|mcg|ml|g|iu|units?|tablet|tab|cap|capsule)/gi;
  // Timing patterns
  const timingPatterns: [RegExp, string][] = [
    [/\b(twice\s+daily|bid|b\.i\.d)\b/i, "Twice daily"],
    [/\b(three\s+times?\s+daily|tid|t\.i\.d)\b/i, "Three times daily"],
    [/\b(four\s+times?\s+daily|qid|q\.i\.d)\b/i, "Four times daily"],
    [/\b(once\s+daily|od|o\.d|daily)\b/i, "Once daily"],
    [/\b(every\s+\d+\s+hours?)\b/i, "As directed"],
    [/\b(morning|am)\b/i, "Morning"],
    [/\b(night|evening|pm|bedtime|hs|h\.s)\b/i, "Night"],
    [/\b(before\s+(food|meals?|eating))\b/i, "Before food"],
    [/\b(after\s+(food|meals?|eating))\b/i, "After food"],
    [/\b(with\s+(food|meals?))\b/i, "With food"],
    [/\b(empty\s+stomach)\b/i, "Empty stomach"],
  ];

  // Strategy 1: Line-by-line scan for known drug names
  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const drug of KNOWN_MEDS) {
      if (lower.includes(drug)) {
        const dosageMatch = line.match(dosageRegex);
        let timing = "Once daily";
        let instructions = "";
        for (const [pattern, label] of timingPatterns) {
          if (pattern.test(line)) {
            if (["Before food", "After food", "With food", "Empty stomach"].includes(label)) {
              instructions = label;
            } else {
              timing = label;
            }
          }
        }
        // Check surrounding lines for extra info
        const lineIdx = lines.indexOf(line);
        const context = lines.slice(Math.max(0, lineIdx - 1), lineIdx + 3).join(" ");
        for (const [pattern, label] of timingPatterns) {
          if (pattern.test(context)) {
            if (["Before food", "After food", "With food", "Empty stomach"].includes(label)) {
              instructions = instructions || label;
            } else {
              timing = timing === "Once daily" ? label : timing;
            }
          }
        }

        // Avoid duplicates
        if (!meds.find(m => m.name.toLowerCase() === drug)) {
          meds.push({
            name: drug.charAt(0).toUpperCase() + drug.slice(1),
            dosage: dosageMatch ? dosageMatch[0] : "As prescribed",
            timing,
            instructions: instructions || "Take as directed",
          });
        }
        break;
      }
    }
  }

  // Strategy 2: Pattern-based extraction for lines with dosage info but no known drug
  if (meds.length === 0) {
    for (const line of lines) {
      const dosageMatch = line.match(dosageRegex);
      if (dosageMatch && line.length > 5) {
        // Try to extract the word before the dosage as the drug name
        const beforeDosage = line.substring(0, line.indexOf(dosageMatch[0])).trim();
        const words = beforeDosage.split(/\s+/).filter(w => w.length > 2);
        const name = words.length > 0 ? words[words.length - 1] : line.split(/\s+/)[0];

        if (name && name.length > 2) {
          let timing = "Once daily";
          let instructions = "";
          for (const [pattern, label] of timingPatterns) {
            if (pattern.test(line)) {
              if (["Before food", "After food", "With food", "Empty stomach"].includes(label)) {
                instructions = label;
              } else {
                timing = label;
              }
            }
          }
          meds.push({
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            dosage: dosageMatch[0],
            timing,
            instructions: instructions || "Take as directed",
          });
        }
      }
    }
  }

  return meds;
}

const PrescriptionScanner = ({ onMedicationsDetected }: PrescriptionScannerProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [editableText, setEditableText] = useState("");
  const [parsedMeds, setParsedMeds] = useState<ParsedMed[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");
    setParsedMeds([]);
    setShowResults(false);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setExtractedText(text);
      setEditableText(text);
      const meds = parseMedicationsFromText(text);
      setParsedMeds(meds);
      setShowResults(true);

      if (meds.length > 0) {
        toast.success(`Detected ${meds.length} medication(s) from prescription`);
      } else {
        toast.info("No medications auto-detected. You can edit the text and retry, or add manually.");
      }
    } catch {
      toast.error("OCR processing failed. Please try a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reparse = () => {
    const meds = parseMedicationsFromText(editableText);
    setParsedMeds(meds);
    if (meds.length > 0) {
      toast.success(`Detected ${meds.length} medication(s)`);
    } else {
      toast.info("No medications detected from text");
    }
  };

  const removeParsedMed = (index: number) => {
    setParsedMeds(prev => prev.filter((_, i) => i !== index));
  };

  const updateParsedMed = (index: number, field: keyof ParsedMed, value: string) => {
    setParsedMeds(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const confirmAndAdd = () => {
    if (parsedMeds.length === 0) {
      toast.error("No medications to add");
      return;
    }
    onMedicationsDetected(parsedMeds);
    toast.success(`${parsedMeds.length} medication(s) added to your tracker`);
    resetScanner();
  };

  const resetScanner = () => {
    setImageUrl(null);
    setExtractedText("");
    setEditableText("");
    setParsedMeds([]);
    setShowResults(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Highlight known med names in text
  const highlightText = (text: string) => {
    let highlighted = text;
    for (const med of KNOWN_MEDS) {
      const regex = new RegExp(`(${med})`, "gi");
      highlighted = highlighted.replace(regex, `<mark class="bg-primary/20 text-primary font-semibold rounded px-0.5">$1</mark>`);
    }
    // Highlight dosages
    highlighted = highlighted.replace(
      /(\d+\.?\d*\s*(?:mg|mcg|ml|g|iu|units?|tablet|tab|cap|capsule))/gi,
      `<mark class="bg-warning/20 text-warning font-semibold rounded px-0.5">$1</mark>`
    );
    return highlighted;
  };

  return (
    <div className="eldercare-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScanText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Prescription Scanner</h2>
        </div>
        {imageUrl && (
          <Button variant="ghost" size="sm" onClick={resetScanner}>
            <X className="w-4 h-4 mr-1" />Clear
          </Button>
        )}
      </div>

      {!imageUrl ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Upload Prescription Image</p>
          <p className="text-xs text-muted-foreground">
            Supports handwritten & printed prescriptions (JPG, PNG, WEBP)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
            <img src={imageUrl} alt="Prescription" className="w-full max-h-48 object-contain" />
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Processing prescription with OCR...</span>
                <span className="ml-auto font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Extracted Text */}
          {showResults && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Extracted Text
                    <span className="text-xs text-muted-foreground font-normal">(edit if needed)</span>
                  </p>
                  <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={reparse}>
                    <ScanText className="w-3 h-3" />Re-parse
                  </Button>
                </div>
                {/* Highlighted preview */}
                <div
                  className="bg-muted/50 rounded-lg p-3 text-sm mb-2 max-h-28 overflow-y-auto leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightText(extractedText) }}
                />
                {/* Editable textarea */}
                <textarea
                  className="w-full rounded-lg border border-border bg-card p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  value={editableText}
                  onChange={e => setEditableText(e.target.value)}
                  placeholder="Edit extracted text here..."
                />
              </div>

              {/* Parsed Medications */}
              {parsedMeds.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Detected Medications ({parsedMeds.length})
                  </p>
                  <div className="space-y-2">
                    {parsedMeds.map((med, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input
                            className="text-sm font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
                            value={med.name}
                            onChange={e => updateParsedMed(i, "name", e.target.value)}
                          />
                          <input
                            className="text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 text-muted-foreground"
                            value={med.dosage}
                            onChange={e => updateParsedMed(i, "dosage", e.target.value)}
                          />
                          <input
                            className="text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 text-muted-foreground"
                            value={med.timing}
                            onChange={e => updateParsedMed(i, "timing", e.target.value)}
                          />
                          <input
                            className="text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 text-muted-foreground"
                            value={med.instructions}
                            onChange={e => updateParsedMed(i, "instructions", e.target.value)}
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => removeParsedMed(i)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedMeds.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                  No medications detected. Try editing the text above and clicking "Re-parse".
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={confirmAndAdd} disabled={parsedMeds.length === 0}>
                  <Check className="w-4 h-4" />
                  Confirm & Add {parsedMeds.length} Medication{parsedMeds.length !== 1 ? "s" : ""}
                </Button>
                <Button variant="outline" onClick={resetScanner}>Cancel</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptionScanner;
