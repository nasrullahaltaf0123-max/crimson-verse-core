import { CheckCircle, X, MessageCircle, Share2, Copy } from "lucide-react";
import { CrimsonButton } from "@/components/CrimsonButton";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  patientName: string;
  bloodGroup: string;
}

const EmergencySuccessModal = ({ open, onClose, patientName, bloodGroup }: Props) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const shareText = encodeURIComponent(
    `🚨 URGENT: ${bloodGroup} blood needed for ${patientName}! BM College English students — please help if you can donate. Check details: `
  );
  const shareUrl = encodeURIComponent(window.location.origin + "/urgent");
  const whatsappLink = `https://wa.me/?text=${shareText}${shareUrl}`;
  const messengerLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `🚨 URGENT: ${bloodGroup} blood needed for ${patientName}! BM College English students — please help. ${window.location.origin}/urgent`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-elevated animate-fade-up overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold italic text-foreground mb-1">
            Request Posted! 🚨
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Your emergency request for <span className="font-bold text-primary">{bloodGroup}</span> blood is now live. Share it with your class group immediately.
          </p>
        </div>

        {/* Request badge */}
        <div className="bg-surface-low rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-headline text-xl font-bold">
              {bloodGroup}
            </div>
            <div>
              <p className="font-body font-bold text-foreground text-sm">{patientName}</p>
              <p className="font-body text-xs text-muted-foreground">Emergency Blood Request • Active</p>
            </div>
          </div>
        </div>

        {/* Share urgently */}
        <div className="text-center mb-4">
          <h3 className="font-headline text-lg font-bold italic text-primary mb-1">
            Send to class group now!
          </h3>
          <p className="font-body text-xs text-muted-foreground">Every second counts — share immediately</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 bg-[hsl(142,70%,40%)] text-primary-foreground rounded-xl font-body font-bold text-sm active:scale-95 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Group
          </a>
          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 bg-[hsl(220,70%,45%)] text-primary-foreground rounded-xl font-body font-bold text-sm active:scale-95 transition-all"
          >
            <Share2 className="h-4 w-4" />
            Messenger
          </a>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 bg-muted rounded-xl font-body font-bold text-sm text-foreground active:scale-95 transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Emergency Link"}
        </button>

        <CrimsonButton variant="outline" className="w-full" onClick={onClose}>
          Done
        </CrimsonButton>
      </div>
    </div>
  );
};

export default EmergencySuccessModal;
