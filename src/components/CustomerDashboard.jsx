import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Grid,
  useMediaQuery
} from "@mui/material";
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  signOut
} from "../firebase";
import AIAssistant from "./AIAssistant";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    plate: "",
    mileage: "",
    issues: ""
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCustomer({ name: data.name || "", phone: data.phone || "" });
          setVehicle(data.vehicle || {});
          if (!(data.vehicle?.make && data.vehicle?.model)) setEditMode(true);
        } else {
          setEditMode(true);
        }

        const apptSnap = await getDocs(collection(db, "appointments"));
        const apptList = apptSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((a) => a.userId === user.uid);
        setAppointments(apptList);
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  const handleCustomerChange = (field) => (e) => {
    setCustomer({ ...customer, [field]: e.target.value });
  };

  const handleVehicleChange = (field) => (e) => {
    setVehicle({ ...vehicle, [field]: e.target.value });
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        name: customer.name,
        phone: customer.phone,
        vehicle
      }, { merge: true });
      setEditMode(false);
    } catch (error) {
      console.error("❌ Error saving user info:", error);
    }
  };

  const handleAISummary = async (summary) => {
    if (!user?.uid) return;
    const updatedVehicle = { ...vehicle, issues: summary };
    setVehicle(updatedVehicle);
    await setDoc(doc(db, "users", user.uid), { vehicle: updatedVehicle }, { merge: true });
  };

  const handleAppointment = async ({ date, time, reason }) => {
    if (!user?.uid || !reason) return;

    const apptData = {
      userId: user.uid,
      name: customer.name,
      phone: customer.phone,
      vehicle,
      date,
      time,
      reason,
      timestamp: new Date().toISOString()
    };

    try {
      const docRef = doc(db, "appointments", `${user.uid}-${Date.now()}`);
      await setDoc(docRef, apptData);
      setAppointments((prev) => [...prev, { id: docRef.id, ...apptData }]);
    } catch (error) {
      console.error("❌ Error saving appointment:", error);
    }
  };

  const handleVinLookup = async () => {
    if (!vehicle.vin) return;
    try {
      const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vehicle.vin}?format=json`);
      const data = response.data.Results;
      const year = data.find((d) => d.Variable === "Model Year")?.Value;
      const make = data.find((d) => d.Variable === "Make")?.Value;
      const model = data.find((d) => d.Variable === "Model")?.Value;
      setVehicle((prev) => ({ ...prev, year, make, model }));
    } catch (err) {
      console.error("❌ VIN lookup failed:", err);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Paper sx={{ p: 3, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center" }}>
        <Typography variant="h6" sx={{ mb: isMobile ? 1 : 0 }}>Welcome, {user?.email}</Typography>
        <Button variant="outlined" fullWidth={isMobile} onClick={handleLogout}>Logout</Button>
      </Paper>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Contact & Vehicle Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Typography>Loading...</Typography>
        ) : editMode ? (
          <Stack spacing={2}>
            <TextField label="Name" value={customer.name} onChange={handleCustomerChange("name")} fullWidth />
            <TextField label="Phone" value={customer.phone} onChange={handleCustomerChange("phone")} fullWidth />
            <TextField label="License Plate" value={vehicle.plate} onChange={handleVehicleChange("plate")} fullWidth />
            <TextField label="VIN" value={vehicle.vin} onChange={handleVehicleChange("vin")} fullWidth />
            <Button variant="outlined" onClick={handleVinLookup}>Lookup VIN</Button>
            <TextField label="Make" value={vehicle.make} onChange={handleVehicleChange("make")} fullWidth />
            <TextField label="Model" value={vehicle.model} onChange={handleVehicleChange("model")} fullWidth />
            <TextField label="Year" value={vehicle.year} onChange={handleVehicleChange("year")} fullWidth />
            <TextField label="Mileage" value={vehicle.mileage || ""} onChange={handleVehicleChange("mileage")} fullWidth />
            <TextField label="Issues" value={vehicle.issues || ""} onChange={handleVehicleChange("issues")} fullWidth multiline rows={2} />
            <Button variant="contained" onClick={handleSave}>Save Info</Button>
          </Stack>
        ) : (
          <Box>
            <Typography><strong>Name:</strong> {customer.name || "N/A"}</Typography>
            <Typography><strong>Phone:</strong> {customer.phone || "N/A"}</Typography>
            <Typography><strong>License Plate:</strong> {vehicle.plate || "N/A"}</Typography>
            <Typography><strong>VIN:</strong> {vehicle.vin || "N/A"}</Typography>
            <Typography><strong>Make:</strong> {vehicle.make || "N/A"}</Typography>
            <Typography><strong>Model:</strong> {vehicle.model || "N/A"}</Typography>
            <Typography><strong>Year:</strong> {vehicle.year || "N/A"}</Typography>
            <Typography><strong>Mileage:</strong> {vehicle.mileage || "N/A"}</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
              <strong>Issues:</strong> {vehicle.issues?.trim() || "None listed"}
            </Typography>
            <Button sx={{ mt: 2 }} variant="outlined" fullWidth={isMobile} onClick={() => setEditMode(true)}>
              Edit Info
            </Button>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Your Appointments</Typography>
        {appointments.length === 0 ? (
          <Typography>No appointments yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {appointments.map((appt) => (
              <Paper key={appt.id} sx={{ p: 2 }}>
                <Typography><strong>Date:</strong> {appt.date}</Typography>
                <Typography><strong>Time:</strong> {appt.time}</Typography>
                <Typography><strong>Reason:</strong> {appt.reason}</Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* AI Chat assistant */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: chatOpen ? "flex" : "none",
          flexDirection: "column",
          backgroundColor: "background.paper",
          ...(isMobile
            ? {}
            : {
                bottom: 24,
                right: 24,
                width: 350,
                height: 500,
                borderRadius: 2,
                boxShadow: 6,
                inset: "auto"
              })
        }}
      >
        <Box sx={{ p: 1, backgroundColor: "#1976d2", color: "white", display: "flex", justifyContent: "space-between" }}>
          <Typography>AI Assistant</Typography>
          <Button onClick={() => setChatOpen(false)} sx={{ color: "white", fontSize: 12 }}>Close</Button>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
          <AIAssistant userId={user?.uid} onSend={handleAISummary} onSchedule={handleAppointment} />
        </Box>
      </Box>

      {!chatOpen && (
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
          <Button
            variant="contained"
            sx={{ borderRadius: "50%", width: 56, height: 56 }}
            onClick={() => setChatOpen(true)}
          >
            Ask
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomerDashboard;
