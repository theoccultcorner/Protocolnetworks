import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from "@mui/material";
import {
  db,
  doc,
  getDoc,
  collection,
  addDoc
} from "../firebase";
import "./MessengerChat.css"; // Custom Messenger style

const AIAssistant = ({ userId, onSend, onSchedule }) => {
  const [vehicle, setVehicle] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [appointment, setAppointment] = useState({ date: "", time: "", reason: "" });

  const bottomRef = useRef(null);
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

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
        setVehicle(vehicleData);

        const systemPrompt = {
          role: "system",
          content: `You are a helpful AI assistant for an auto repair shop. 
Ask customers to describe their car issues, suggest potential diagnostics, 
and summarize their concern as a brief reason for an appointment. 
Vehicle: ${vehicleData.year || "unknown"} ${vehicleData.make || ""} ${vehicleData.model || ""}`
        };

        setMessages([systemPrompt]);
      } catch (err) {
        console.error("Failed to initialize assistant:", err);
      }
    };

    if (userId && apiKey) initAssistant();
  }, [userId]);

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

      const reply = result.data.choices[0].message.content;
      const aiMessage = { role: "assistant", content: reply };
      const combinedMessages = [...updatedMessages, aiMessage];
      setMessages(combinedMessages);
      setChatLog((prev) => [...prev, aiMessage]);

      await addDoc(collection(doc(db, "users", userId), "chatHistory"), {
        timestamp: new Date().toISOString(),
        user: input,
        ai: reply
      });

      if (reply.toLowerCase().includes("schedule") || reply.toLowerCase().includes("appointment")) {
        const extractedReason = reply
          .split("\n")
          .find((line) => line.toLowerCase().includes("reason") || line.toLowerCase().includes("summary"))
          || "Appointment requested via AI assistant";

        setAppointment((prev) => ({ ...prev, reason: extractedReason }));
        setShowScheduleDialog(true);
      }

      if (reply.toLowerCase().includes("summary") || reply.toLowerCase().includes("send to the mechanic")) {
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
    setShowScheduleDialog(false);
    setAppointment({ date: "", time: "", reason: "" });
  };

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 2 }}>
        AI Service Assistant
      </Typography>

      <Box className="messenger-chat">
        {chatLog.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role}`}>
            <div className={`message ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </Box>

      <Box className="chat-input-area">
        <input
          type="text"
          placeholder="Describe your issue..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </Box>

      <Dialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)}>
        <DialogTitle>Schedule Appointment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={appointment.date}
              onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
              fullWidth
            />
            <TextField
              type="time"
              label="Time"
              InputLabelProps={{ shrink: true }}
              value={appointment.time}
              onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
              fullWidth
            />
            <TextField
              label="Reason"
              value={appointment.reason}
              onChange={(e) => setAppointment({ ...appointment, reason: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AIAssistant;
