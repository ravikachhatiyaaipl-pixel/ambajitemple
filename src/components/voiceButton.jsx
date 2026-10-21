// src/components/VoiceButton.jsx

import React, { useState, useEffect, useRef } from "react";
import { getVoiceAssistant, isVoiceSupported } from "../utils/ai-knowledge";

const VoiceButton = ({ onCommand, onTranscript, onListeningChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState("");
  const assistantRef = useRef(null);

  useEffect(() => {
    const supported = isVoiceSupported();
    setIsSupported(supported);
    if (!supported) return;

    const assistant = getVoiceAssistant();
    assistantRef.current = assistant;

    // Wire all callbacks — these are read at call-time so they always get
    // the latest prop values even if props change between renders.
    assistant.onCommand = (command, data) => {
      if (onCommand) onCommand(command, data);
    };

    assistant.onInterimResult = (transcript) => {
      setInterimTranscript(transcript);
      if (onTranscript) onTranscript(transcript, false);
    };

    assistant.onFinalResult = (transcript) => {
      setInterimTranscript("");
      if (onTranscript) onTranscript(transcript, true);
    };

    // Use the state-change callback instead of polling
    assistant.onStateChange = (active) => {
      setIsListening(active);
      if (onListeningChange) onListeningChange(active);
    };

    return () => {
      // Clean up callbacks on unmount
      if (assistantRef.current) {
        assistantRef.current.onCommand = null;
        assistantRef.current.onInterimResult = null;
        assistantRef.current.onFinalResult = null;
        assistantRef.current.onStateChange = null;
      }
    };
  }, []); // run once on mount

  // Re-wire onCommand whenever the prop changes (it can change across renders)
  useEffect(() => {
    if (assistantRef.current) {
      assistantRef.current.onCommand = (command, data) => {
        if (onCommand) onCommand(command, data);
      };
    }
  }, [onCommand]);

  const toggleListening = () => {
    const assistant = assistantRef.current;
    if (!assistant) return;

    if (isListening) {
      assistant.stop();
      setIsListening(false);
      if (onListeningChange) onListeningChange(false);
    } else {
      assistant.start(); // start() handles mic permission internally
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        style={{
          padding: "8px 14px",
          borderRadius: "50px",
          border: "1px solid #dee2e6",
          backgroundColor: "#6c757d",
          color: "white",
          cursor: "not-allowed",
          opacity: 0.5,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        title="Voice not supported in this browser"
      >
        🎤 Not Supported
      </button>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={toggleListening}
        className={`voice-btn ${isListening ? "listening" : ""}`}
        style={{
          padding: "10px 18px",
          borderRadius: "50px",
          border: "none",
          backgroundColor: isListening ? "#dc3545" : "#28a745",
          color: "white",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s ease",
          boxShadow: isListening
            ? "0 0 20px rgba(220, 53, 69, 0.4)"
            : "0 2px 8px rgba(0, 0, 0, 0.15)",
          animation: isListening ? "pulse-voice 1.5s ease-in-out infinite" : "none",
        }}
        title={isListening ? "Stop listening" : "Start voice command"}
      >
        <span>{isListening ? "⏹️" : "🎤"}</span>
        <span>{isListening ? "Stop" : "Voice"}</span>
      </button>

      {interimTranscript && isListening && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            whiteSpace: "nowrap",
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            zIndex: 1000,
          }}
        >
          🎤 {interimTranscript}
        </div>
      )}
    </div>
  );
};

// CSS animations — injected once
if (!document.getElementById("voice-btn-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "voice-btn-styles";
  styleSheet.textContent = `
    @keyframes pulse-voice {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .voice-btn:hover { transform: scale(1.02); }
    .voice-btn:active { transform: scale(0.98); }
  `;
  document.head.appendChild(styleSheet);
}

export default VoiceButton;
