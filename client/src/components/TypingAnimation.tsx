import { useState, useEffect } from "react";

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypingAnimation({ 
  phrases, 
  typingSpeed = 100, 
  deletingSpeed = 50, 
  pauseDuration = 2000 
}: TypingAnimationProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (!isDeleting && currentText === currentPhrase) {
      const pauseTimeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setCurrentText((prev) =>
          isDeleting
            ? currentPhrase.substring(0, prev.length - 1)
            : currentPhrase.substring(0, prev.length + 1)
        );
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className="inline-flex items-center">
      <span className="text-foreground">{currentText}</span>
      <span className={`ml-1 text-primary ${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>
    </span>
  );
}
