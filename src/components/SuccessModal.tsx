import { CheckCircle, Heart, X } from "lucide-react";
import { CrimsonButton } from "@/components/CrimsonButton";
import { useNavigate } from "react-router-dom";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const SuccessModal = ({ open, onClose }: SuccessModalProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-elevated animate-fade-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-primary-foreground" />
        </div>

        <h2 className="font-headline text-3xl font-bold italic text-foreground mb-3">
          Welcome to the Circle
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
          Your registration has been submitted. Our verification team will review your documents and activate your donor profile within 24–48 hours.
        </p>

        <div className="border-l-4 border-primary pl-4 text-left mb-8">
          <p className="font-headline italic text-primary/70">
            "One unit of blood can save up to three lives."
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CrimsonButton variant="primary" className="w-full" onClick={() => navigate("/search")}>
            Browse Donors
          </CrimsonButton>
          <CrimsonButton variant="ghost" className="w-full" onClick={() => navigate("/")}>
            <Heart className="mr-2 h-4 w-4" />
            Back to Home
          </CrimsonButton>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
