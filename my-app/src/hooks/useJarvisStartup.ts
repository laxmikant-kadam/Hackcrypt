// frontend/src/hooks/useJarvisStartup.ts
import { useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

export const useJarvisStartup = () => {
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    const initializeJarvis = () => {
      const greetings = [
        "Initializing JARVIS",
        "Starting all systems applications",
        "Checking all drivers",
        "All systems are operational",
        "I am online and ready"
      ];

      const hour = new Date().getHours();
      let timeGreeting = "Good evening";
      if (hour < 12) timeGreeting = "Good morning";
      else if (hour < 18) timeGreeting = "Good afternoon";

      greetings.forEach((msg, i) => {
        setTimeout(() => speak({ text: msg }), i * 1500);
      });

      setTimeout(() => speak({ text: timeGreeting }), greetings.length * 1500);
    };

    initializeJarvis();
  }, [speak]);
};