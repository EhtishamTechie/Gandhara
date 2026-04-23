// src/hooks/useTypewriter.js
import { useState, useEffect } from 'react';

const useTypewriter = (text, speed = 100, initialDelay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setIsTypingComplete(false); // Reset on text change
    setDisplayText(''); // Clear display text on new text or remount
    let timeoutId; // To store the timeout for initialDelay
    let typingIntervalId; // To store the interval for typing

    const startTyping = () => {
      let i = 0;
      // Clear any existing interval before starting a new one
      if (typingIntervalId) {
        clearInterval(typingIntervalId);
      }
      
      typingIntervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingIntervalId);
          setIsTypingComplete(true);
        }
      }, speed);
    };

    if (initialDelay > 0) {
      timeoutId = setTimeout(() => {
        startTyping();
      }, initialDelay);
    } else {
      startTyping();
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutId); // Clear initial delay timeout
      clearInterval(typingIntervalId); // Clear typing interval
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, initialDelay]); // Rerun if text, speed, or initialDelay changes


  return { displayText, isTypingComplete };
};

export default useTypewriter;