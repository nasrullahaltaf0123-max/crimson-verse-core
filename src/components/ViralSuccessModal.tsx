import { CheckCircle, Heart, X, Share2, MessageCircle, Users } from "lucide-react";
import { CrimsonButton } from "@/components/CrimsonButton";

interface ViralSuccessModalProps {
  open: boolean;
  onClose: () => void;
  donorName: string;
  bloodGroup: string;
  accessToken?: string;
}

const ViralSuccessModal = ({ open, onClose, donorName, bloodGroup, accessToken }: ViralSuccessModalProps) => {
  if (!open) return null;

  const shareText = encodeURIComponent(
    `I just joined Crimson Verse as a blood donor 🩸 BM College English Department students — add your blood info too! It takes 30 seconds. 👉`
  );
  const shareUrl = encodeURIComponent(window.location.origin + "/join");

  const whatsappLink = `https://wa.me/?text=${shareText}%20${shareUrl}`;
  const messengerLink = `https://www.facebook.com/dialog/send?link=${shareUrl}&app_id=0&redirect_uri=${shareUrl}`;
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;

  const firstName = donorName.split(" ")[0] || "Donor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-elevated animate-fade-up overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        {/* Badge preview */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            {bloodGroup && (
              <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-xs font-body font-bold px-2.5 py-1 rounded-full shadow-ambient">
                {bloodGroup}
              </div>
            )}
          </div>

          <h2 className="font-headline text-2xl sm:text-3xl font-bold italic text-foreground mb-1">
            You're In, {firstName}! 🎉
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            You're now part of the Crimson Verse donor circle. Your profile will be active instantly.
          </p>
        </div>

        {/* Donor badge card */}
        <div className="bg-surface-low rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-headline text-xl font-bold">
              {firstName.charAt(0)}
            </div>
            <div>
              <p className="font-body font-bold text-foreground text-sm">{donorName || "Donor"}</p>
              <p className="font-body text-xs text-muted-foreground">Verified Student Donor • {bloodGroup || "—"}</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-body font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                <Heart className="h-3 w-3" /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-3 bg-accent/40 rounded-xl p-4 mb-6">
          <Users className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="font-body text-sm text-foreground">
            <span className="font-bold">47 classmates</span> already joined this week
          </p>
        </div>

        {/* Share section */}
        <div className="text-center mb-4">
          <h3 className="font-headline text-lg font-bold italic text-foreground mb-1">
            Help your batchmates join too
          </h3>
          <p className="font-body text-xs text-muted-foreground">Share in your class group — it takes them 30 seconds</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 bg-[hsl(142,70%,40%)] text-primary-foreground rounded-xl font-body font-bold text-sm active:scale-95 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={fbLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 bg-[hsl(220,70%,45%)] text-primary-foreground rounded-xl font-body font-bold text-sm active:scale-95 transition-all"
          >
            <Share2 className="h-4 w-4" />
            Facebook
          </a>
        </div>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.origin + "/join");
          }}
          className="w-full py-3 bg-muted rounded-xl font-body font-bold text-sm text-foreground active:scale-95 transition-all mb-4"
        >
          📋 Copy Link to Share
        </button>

        {/* Profile link */}
        {accessToken && (
          <a
            href={`/profile?token=${accessToken}`}
            className="w-full py-3 bg-accent rounded-xl font-body font-bold text-sm text-foreground active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
          >
            👤 View My Donor Profile
          </a>
        )}

        <p className="text-center font-headline italic text-sm text-primary/60">
          "Your blood, someone's next chapter."
        </p>
      </div>
    </div>
  );
};

export default ViralSuccessModal;
