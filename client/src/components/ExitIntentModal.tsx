import { useEffect, useState } from "react";
import { X, Sparkles, TrendingUp, Bell, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function ExitIntentModal() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (user || hasShown) return;

    const hasDismissed = sessionStorage.getItem("goldh-exit-intent-dismissed");
    if (hasDismissed) {
      setHasShown(true);
      return;
    }

    let mouseY = 0;
    let lastMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseY = mouseY;
      mouseY = e.clientY;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when:
      // 1. Mouse is leaving through the top of the viewport (towards tabs/address bar)
      // 2. Mouse was moving upward (clientY < lastMouseY)
      // 3. Mouse is very close to the top edge (clientY <= 5)
      // 4. relatedTarget is null (leaving the document entirely)
      const isLeavingTop = e.clientY <= 5;
      const wasMovingUp = mouseY < lastMouseY;
      const isLeavingDocument = e.relatedTarget === null;
      
      if (isLeavingTop && wasMovingUp && isLeavingDocument && !hasShown) {
        setShow(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseLeave);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [user, hasShown]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("goldh-exit-intent-dismissed", "true");
  };

  if (user || !show) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        data-testid="exit-intent-overlay"
      >
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-[#C7AE6A]/40 rounded-lg p-8 relative"
            style={{
              boxShadow: "0 0 60px rgba(199, 174, 106, 0.3)"
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#C7AE6A] transition-colors"
              data-testid="button-close-exit-intent"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block mb-4"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C7AE6A] to-[#F5E6C8] mx-auto flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-3" style={{ color: "#C7AE6A" }}>
                Before you go...
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Don't miss out on Golden Horizon's exclusive crypto intelligence.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-md bg-white/5">
                <TrendingUp className="w-5 h-5 text-[#C7AE6A] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Real-Time Market Intelligence</h4>
                  <p className="text-sm text-gray-400">Track whale movements and smart money flows</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-white/5">
                <Bell className="w-5 h-5 text-[#C7AE6A] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Instant Alerts & Insights</h4>
                  <p className="text-sm text-gray-400">Stay ahead with curated crypto news and analysis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-white/5">
                <Target className="w-5 h-5 text-[#C7AE6A] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Portfolio Tracking</h4>
                  <p className="text-sm text-gray-400">Monitor your assets across all major chains</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/signup">
                <Button
                  className="w-full text-lg py-6"
                  style={{
                    background: "linear-gradient(135deg, #C7AE6A 0%, #F5E6C8 50%, #C7AE6A 100%)",
                    color: "#000",
                    fontWeight: "700"
                  }}
                  onClick={handleClose}
                  data-testid="button-signup-exit-intent"
                >
                  Join Golden Horizon
                </Button>
              </Link>
              
              <button
                onClick={handleClose}
                className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
                data-testid="button-close-text"
              >
                No thanks, I'll pass on this opportunity
              </button>
            </div>
          </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
