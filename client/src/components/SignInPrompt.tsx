import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

interface SignInPromptProps {
  onClose?: () => void;
}

const DISMISS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const DISMISS_KEY = 'goldh-signin-prompt-dismissed';

export function SignInPrompt({ onClose }: SignInPromptProps) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if user is authenticated
    if (user) {
      return;
    }

    // Check if prompt was recently dismissed (within cooldown period)
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const timeSinceDismissal = Date.now() - parseInt(dismissedAt, 10);
      if (timeSinceDismissal < DISMISS_COOLDOWN_MS) {
        // Still within cooldown period - don't show
        return;
      }
    }

    // Show the modal automatically after a short delay on page load
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    // Store dismissal timestamp in localStorage
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    onClose?.();
  };

  if (user || dismissed || !show) {
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
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
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
                Golden Horizon
              </h3>
              <p className="text-gray-400 text-sm">
                Sign in to get the most out of Golden Horizon
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
