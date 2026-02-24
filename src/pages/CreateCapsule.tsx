import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, VideoIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import BrutalistButton from "@/components/BrutalistButton";
import { useCapsules } from "@/store/capsuleStore";
import { MediaFile } from "@/store/capsuleStore";
import { cn } from "@/lib/utils";

const CreateCapsule: React.FC = () => {
  const navigate = useNavigate();
  const { addCapsule } = useCapsules();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState<Date>();
  const [shareEmail, setShareEmail] = useState("");
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: MediaFile[] = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newVideos: MediaFile[] = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !unlockDate) return;
    addCapsule({
      title,
      content,
      unlockAt: unlockDate,
      shareEmail: shareEmail || undefined,
      weather: "Partly cloudy, 14°C",
      photos,
      videos,
    });
    navigate("/dashboard");
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
          <div>
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
                    <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover" />
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
              <PopoverContent className="w-auto p-0 border-2 border-foreground rounded-none brutalist-shadow" align="start">
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

          {/* Share Email */}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-2">
              Share via Email (optional)
            </label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="friend@example.com"
              className="brutalist-input w-full text-foreground"
            />
          </div>

          {/* Submit */}
          <BrutalistButton type="submit" variant="accent" fullWidth className="text-xl py-5 mt-4">
            ARCHIVE THIS MOMENT
          </BrutalistButton>
        </form>
      </div>
    </div>
  );
};

export default CreateCapsule;
