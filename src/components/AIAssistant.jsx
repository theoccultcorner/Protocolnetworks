import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Box,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  db,
  doc,
  getDoc,
  collection,
  addDoc
} from "../firebase";
import "./MessengerChat.css";

const AIAssistant = ({ userId, onSend, onSchedule }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState({ date: "", time: "", reason: "" });
  const [view, setView] = useState("assistant"); // 'assistant' or 'schedule'

  const bottomRef = useRef(null);
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  useEffect(() => {
    const initAssistant = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        const vehicleData = userSnap.exists() ? userSnap.data().vehicle || {} : {};

        const systemPrompt = {
          role: "system",
          content: `You are a helpful AI assistant for an auto repair shop.
Ask customers to describe their car issues, suggest potential diagnostics,
and summarize their concern to help them schedule an appointment.
Vehicle: ${vehicleData.year || "unknown"} ${vehicleData.make || ""} ${vehicleData.model || ""}`
        };

        setMessages([systemPrompt]);
      } catch (err) {
        console.error("Failed to initialize assistant:", err);
      }
    };

    if (userId && apiKey) initAssistant();
  }, [userId, apiKey]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setChatLog((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: updatedMessages
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply =
        result?.data?.choices?.[0]?.message?.content ||
        "I'm sorry, I didn't catch that. Could you rephrase?";
      const aiMessage = { role: "assistant", content: reply };
      const combinedMessages = [...updatedMessages, aiMessage];
      setMessages(combinedMessages);
      setChatLog((prev) => [...prev, aiMessage]);

      await addDoc(collection(doc(db, "users", userId), "chatHistory"), {
        timestamp: new Date().toISOString(),
        user: input,
        ai: reply
      });

      if (
        reply.toLowerCase().includes("schedule") ||
        reply.toLowerCase().includes("appointment")
      ) {
        // Switch to schedule view but don’t auto-fill the reason
        setView("schedule");
      }

      if (
        reply.toLowerCase().includes("summary") ||
        reply.toLowerCase().includes("send to the mechanic")
      ) {
        onSend && onSend(reply);
      }
    } catch (err) {
      console.error("OpenAI error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleConfirm = () => {
    if (onSchedule && appointment.date && appointment.time) {
      onSchedule({
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason
      });
    }
    setAppointment({ date: "", time: "", reason: "" });
    setView("assistant");
  };

  return (
    <Paper
      sx={{
        width: "100%",
        maxWidth: "600px",
        mx: "auto",
        height: isMobile ? "95vh" : "80vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden"
      }}
    >
      {/* Top Nav Buttons */}
      <Box sx={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        <Button
          onClick={() => setView("assistant")}
          sx={{
            flex: 1,
            borderRadius: 0,
            backgroundColor: view === "assistant" ? "#1976d2" : "#f0f0f0",
            color: view === "assistant" ? "#fff" : "#000"
          }}
        >
          Assistant
        </Button>
        <Button
          onClick={() => setView("schedule")}
          sx={{
            flex: 1,
            borderRadius: 0,
            backgroundColor: view === "schedule" ? "#1976d2" : "#f0f0f0",
            color: view === "schedule" ? "#fff" : "#000"
          }}
        >
          Schedule
        </Button>
      </Box>

      {/* ASSISTANT VIEW */}
      {view === "assistant" && (
        <>
          <Box
            className="messenger-chat"
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              maxHeight: isMobile ? "45vh" : "auto"
            }}
          >
            {chatLog.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className={`message ${msg.role}`}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <Typography variant="body2" sx={{ color: "gray" }}>
                Assistant is thinking...
              </Typography>
            )}
            <div ref={bottomRef} />
          </Box>

          <Box
            className="chat-input-area"
            sx={{
              display: "flex",
              p: 1,
              borderTop: "1px solid #ccc"
            }}
          >
            <input
              type="text"
              placeholder="Describe your issue..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc"
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                marginLeft: "10px",
                padding: "10px 16px",
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </Box>
        </>
      )}

      {/* SCHEDULE VIEW */}
      {view === "schedule" && (
        <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
          <Stack spacing={2}>
            <TextField
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={appointment.date}
              onChange={(e) =>
                setAppointment({ ...appointment, date: e.target.value })
              }
              fullWidth
            />
            <TextField
              type="time"
              label="Time"
              InputLabelProps={{ shrink: true }}
              value={appointment.time}
              onChange={(e) =>
                setAppointment({ ...appointment, time: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Reason for Appointment"
              placeholder="Describe what the appointment is for..."
              value={appointment.reason}
              onChange={(e) =>
                setAppointment({ ...appointment, reason: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
            <Button
              variant="contained"
              onClick={handleScheduleConfirm}
              sx={{ mt: 2 }}
            >
              Confirm Appointment
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AIAssistant;
