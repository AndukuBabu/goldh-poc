import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

interface SignInPromptProps {
  onClose?: () => void;
}

export function SignInPrompt({ onClose }: SignInPromptProps) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hasDismissed = sessionStorage.getItem("goldh-signin-prompt-dismissed");
    if (hasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("goldh-signin-prompt-dismissed", "true");
    onClose?.();
  };

  if (user || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        data-testid="signin-prompt-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-[#1a1a1a] border border-[#C7AE6A]/20 rounded-lg p-8 relative"
            style={{
              boxShadow: "0 0 40px rgba(199, 174, 106, 0.2)"
            }}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#C7AE6A] transition-colors"
              data-testid="button-close-prompt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#C7AE6A" }}>
                Unlock Full Access
              </h3>
              <p className="text-gray-400 text-sm">
                Sign in to track your portfolio, set alerts, and access premium insights.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/signin">
                <Button
                  className="w-full"
                  style={{
                    background: "linear-gradient(135deg, #C7AE6A 0%, #F5E6C8 50%, #C7AE6A 100%)",
                    color: "#000",
                    fontWeight: "600"
                  }}
                  data-testid="button-signin-from-prompt"
                >
                  Sign In
                </Button>
              </Link>
              
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full border-[#C7AE6A]/30 text-[#C7AE6A] hover:bg-[#C7AE6A]/10"
                  data-testid="button-signup-from-prompt"
                >
                  Create Account
                </Button>
              </Link>

              <button
                onClick={handleDismiss}
                className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors pt-2"
                data-testid="button-continue-browsing"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
