import React, { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

const UserContext = ({ children }) => {
  const [recognition, setRecognition] = useState(null);
  const [speaking, setspeaking] = useState(false);
  const [prompt, setPrompt] = useState("listening...");
  const [response, setResponse] = useState(false);

  // 🔊 Speak Function
  function speak(text) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";

    speech.onend = () => {
      setResponse(false);
      setspeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  // 🌐 NODE API CALL (Gemini backend)
 async function aiResponse(promptText) {
  setspeaking(true);
  setResponse(true);
  setPrompt("Thinking...");

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question: promptText }),
});


    const data = await res.json();

    let newText = data.answer
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/google/gi, "Harshita Dewani")
      .slice(0, 250);

    setPrompt(newText);
    speak(newText);
  } catch (err) {
    setPrompt("Server error 😅");
    setspeaking(false);
  }
}


  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = "en-IN";

    rec.onresult = (e) => {
      const transcript = e.results[e.resultIndex][0].transcript;
      setPrompt(transcript);
      takeCommand(transcript.toLowerCase());
    };

    function takeCommand(command) {
      if (command.includes("open") && command.includes("youtube")) {
        setspeaking(true);
        setResponse(true);
        window.open("https://www.youtube.com", "_blank");
        speak("Opening YouTube");
        setPrompt("Opening YouTube...");
      }
      else if (command.includes("open") && command.includes("google")) {
        setspeaking(true);
        setResponse(true);
        window.open("https://www.google.com", "_blank");
        speak("Opening Google");
        setPrompt("Opening Google...");
      }
      else if (command.includes("open") && command.includes("instagram")) {
        setspeaking(true);
        setResponse(true);
        window.open("https://www.instagram.com", "_blank");
        speak("Opening Instagram");
        setPrompt("Opening Instagram...");
      }
      else if (command.includes("time")) {
        setspeaking(true);
        setResponse(true);
        const time = new Date().toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "numeric",
        });
        speak(`The time is ${time}`);
        setPrompt(time);
      }
      else if (command.includes("date")) {
        setspeaking(true);
        setResponse(true);
        const date = new Date().toLocaleDateString("en-IN");
        speak(`Today's date is ${date}`);
        setPrompt(date);
      }
      else {
        aiResponse(command); // 🔥 NODE API CALL
      }
    }

    setRecognition(rec);
  }, []);

  return (
    <DataContext.Provider
      value={{
        recognition,
        speaking,
        setspeaking,
        prompt,
        response,
        setPrompt,
        setResponse,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default UserContext;