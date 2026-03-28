import React, { useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, VideoIcon, X, Mail, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import BrutalistButton from "@/components/BrutalistButton";
import { useCapsules, Recipient } from "@/store/capsuleStore";
import { useAuth } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LocalMedia {
  file: File;
  name: string;
  type: string;
  preview: string;
}

interface RecipientChip {
  email: string;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 50;

const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const normalizeEmail = (email: string): string => email.toLowerCase().trim();

const CreateCapsule: React.FC = () => {
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const { addCapsule, uploadFiles } = useCapsules();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState<Date>();
  const [recipient, setRecipient] = useState("");
  const [recipients, setRecipients] = useState<RecipientChip[]>([]);
  const [photos, setPhotos] = useState<LocalMedia[]>([]);
  const [videos, setVideos] = useState<LocalMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showShareError, setShowShareError] = useState<string>("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const recipientInputRef = useRef<HTMLInputElement>(null);

  // Deduplicate and validate recipients
  const uniqueRecipients = useMemo(() => {
    const seen = new Set<string>();
    return recipients.filter((r) => {
      if (seen.has(normalizeEmail(r.email))) return false;
      seen.add(normalizeEmail(r.email));
      return true;
    });
  }, [recipients]);

  const addRecipient = (email: string) => {
    const normalized = normalizeEmail(email);
    
    if (!normalized) return;
    if (!validateEmail(normalized)) {
      setShowShareError("Invalid email format. Please check and try again.");
      return;
    }
    if (normalized === normalizeEmail(userEmail || "")) {
      setShowShareError("You cannot share a capsule with your own email address.");
      return;
    }
    if (uniqueRecipients.some((r) => normalizeEmail(r.email) === normalized)) {
      setShowShareError("This email is already in the recipient list.");
      return;
    }
    if (recipients.length >= MAX_RECIPIENTS) {
      setShowShareError(`You can share with a maximum of ${MAX_RECIPIENTS} recipients.`);
      return;
    }
    
    setRecipients((prev) => [...prev, { email: normalized, canReshare: true }]);
    setRecipient("");
    setShowShareError("");
  };

  const removeRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
    setShowShareError("");
  };

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRecipient(e.currentTarget.value);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: LocalMedia[] = Array.from(files).map((file) => ({
      file,
      name: file.name,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newVideos: LocalMedia[] = Array.from(files).map((file) => ({
      file,
      name: file.name,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));
    setVideos((prev) => [...prev, ...newVideos]);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!title){
      toast.error("Title was Missing")
      return
    }
    if(!content){
      toast.error("Content was Missing")
      return
    }
    if(!unlockDate){
      toast.error("Memory Unlocking Date was Missing")
    }
    
    // Client-side validation
    if (recipients.length > MAX_RECIPIENTS) {
      setShowShareError(`Maximum ${MAX_RECIPIENTS} recipients allowed.`);
      recipientInputRef.current?.focus();
      return;
    }

    // Validate all recipient emails
    const invalidEmails = recipients.filter((r) => !validateEmail(r.email));
    if (invalidEmails.length > 0) {
      setShowShareError("One or more recipient emails are invalid.");
      recipientInputRef.current?.focus();
      return;
    }

    setLoading(true);
    const hasSelectedMedia = photos.length > 0 || videos.length > 0;

    let uploadedPhotos: Awaited<ReturnType<typeof uploadFiles>> = [];
    let uploadedVideos: Awaited<ReturnType<typeof uploadFiles>> = [];

    try {
      // Upload media first. If upload fails, do not attempt capsule creation.
      [uploadedPhotos, uploadedVideos] = await Promise.all([
        uploadFiles(photos.map((p) => p.file)),
        uploadFiles(videos.map((v) => v.file)),
      ]);
    } catch {
      setLoading(false);
      return;
    }

    const unlockAt = `${format(unlockDate, "yyyy-MM-dd")}T00:00:00`;
    const payload = {
      title,
      content,
      unlockAt,
      // Support new recipients array format
      ...(uniqueRecipients.length > 0 && {
        recipients: uniqueRecipients as Recipient[],
      }),
      // Legacy support: if only one recipient, also send as shareEmail
      ...(uniqueRecipients.length === 1 && {
        shareEmail: uniqueRecipients[0].email,
      }),
      photos: uploadedPhotos,
      videos: uploadedVideos,
      requireMedia: hasSelectedMedia,
    };
    console.log(`[CreateCapsule] Submitting payload:`, payload);
    const success = await addCapsule(payload);

    setLoading(false);
    if (success) {
      console.log(`[CreateCapsule] Success! Navigating to dashboard...`);
      navigate("/dashboard");
    } else {
      console.error(`[CreateCapsule] addCapsule returned false`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b-2 border-foreground px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-2xl uppercase tracking-widest">Chronos</Link>
        <Link to="/dashboard">
          <BrutalistButton variant="outline" className="text-sm px-4 py-2">Back to Archive</BrutalistButton>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto p-6 md:p-12">
        {/* Header */}
        <div className="border-b-2 border-foreground pb-6 mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Document No. {format(new Date(), "yyyy-MM-dd")}
          </p>
          <h1 className="text-4xl md:text-6xl">CREATE <span className="text-accent">CAPSULE</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              Capsule Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your capsule..."
              className="brutalist-input w-full text-foreground"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              Message / Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message to the future..."
              rows={6}
              className="brutalist-input w-full resize-none text-foreground"
              required
            />
          </div>

          {/* Photo Upload */}
          <div id="media-section">
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              Photos (optional)
            </label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="brutalist-input w-full text-left flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              Click to upload photos...
            </button>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative border-2 border-foreground brutalist-shadow group">
                    <img src={photo.preview} alt={photo.name} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-foreground text-background w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="font-mono text-[10px] p-1 truncate text-muted-foreground">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              Videos (optional)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="brutalist-input w-full text-left flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <VideoIcon className="w-4 h-4" />
              Click to upload videos...
            </button>
            {videos.length > 0 && (
              <div className="space-y-3 mt-4">
                {videos.map((video, i) => (
                  <div key={i} className="border-2 border-foreground brutalist-shadow p-3 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <VideoIcon className="w-4 h-4 text-accent" />
                      <span className="font-mono text-sm truncate max-w-[200px]">{video.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="bg-foreground text-background w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              Unlock Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "brutalist-input w-full text-left flex items-center gap-2",
                    !unlockDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {unlockDate ? format(unlockDate, "PPP") : "Select unlock date..."}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={unlockDate}
                  onSelect={setUnlockDate}
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto bg-card font-mono"
                  classNames={{
                    day_selected: "bg-foreground text-background hover:bg-foreground hover:text-background",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Recipients (Multi-share) */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              🤝 Share With (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 relative">
                <input
                  ref={recipientInputRef}
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onKeyDown={handleRecipientKeyDown}
                  placeholder="Enter recipient email and press Enter..."
                  className={cn(
                    "brutalist-input w-full text-foreground pl-8",
                    showShareError && recipients.length === 0 && "border-red-500 border-2"
                  )}
                />
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => addRecipient(recipient)}
                disabled={!recipient || recipients.length >= MAX_RECIPIENTS}
                className="brutalist-input px-4 py-2 font-mono text-sm uppercase border-2 border-foreground disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Validation Error */}
            {showShareError && (
              <div className="mb-3 p-3 bg-red-50 border-2 border-red-400 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="font-mono text-xs text-red-700">{showShareError}</p>
              </div>
            )}

            {/* Recipients List */}
            {uniqueRecipients.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground">
                  {uniqueRecipients.length} / {MAX_RECIPIENTS} recipients
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueRecipients.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1 bg-foreground text-background border-2 border-foreground font-mono text-xs uppercase"
                    >
                      <span>{r.email}</span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(i)}
                        className="hover:opacity-70 transition-opacity"
                        title="Remove recipient"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-6 border-t-2 border-foreground">
            <BrutalistButton
              type="submit"
              disabled={loading}
              className="w-full py-3 font-heading text-lg uppercase tracking-widest"
              variant="accent"
            >
              {loading ? "Creating..." : "Seal Capsule"}
            </BrutalistButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCapsule;
