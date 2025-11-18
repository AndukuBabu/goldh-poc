import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function WelcomeAnimation() {
  const [location] = useLocation();
  const [show, setShow] = useState(false);
  const hasShownRef = useRef(false);

  // Effect to control show state based on location and sessionStorage
  useEffect(() => {
    // Only show if we're on landing page, haven't shown yet this session, and haven't shown yet in this component lifetime
    if (location === "/" && !sessionStorage.getItem("hasSeenWelcome") && !hasShownRef.current) {
      hasShownRef.current = true;
      sessionStorage.setItem("hasSeenWelcome", "true");
      setShow(true);
    } else if (location !== "/") {
      setShow(false);
    }
  }, [location]);

  // Separate effect to handle auto-dismiss timer when show becomes true
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          data-testid="welcome-animation"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="text-center px-6"
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              style={{
                background: "linear-gradient(135deg, #C7AE6A 0%, #F5E6C8 50%, #C7AE6A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 40px rgba(199, 174, 106, 0.3)"
              }}
              animate={{
                textShadow: [
                  "0 0 40px rgba(199, 174, 106, 0.3)",
                  "0 0 60px rgba(199, 174, 106, 0.5)",
                  "0 0 40px rgba(199, 174, 106, 0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              Congratulations!
            </motion.h1>
            <motion.p
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#C7AE6A]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              You've found Golden Horizon!!
            </motion.p>
            
            <motion.div
              className="mt-8 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#C7AE6A]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
