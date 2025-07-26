import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "../firebase";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  TextField,
  Button,
  Link
} from "@mui/material";

const getServiceRecommendations = (mileage) => {
  const m = parseInt(mileage || "0", 10);
  if (!m) return "Mileage unknown — no service suggestions available.";
  const tips = [];
  if (m >= 3000 && m < 10000) tips.push("Oil change recommended.");
  if (m >= 15000) tips.push("Check air filter and rotate tires.");
  if (m >= 30000) tips.push("Inspect brake pads and flush transmission fluid.");
  return tips.length ? tips.join(" ") : "No major services needed yet.";
};

const CustomerProfileView = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [editStates, setEditStates] = useState({});

  useEffect(() => {
    const fetchAllCustomerData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const apptSnap = await getDocs(collection(db, "appointments"));
        const apptData = apptSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const usersWithAppointments = usersData.map((user) => ({
          ...user,
          appointments: apptData.filter((appt) => appt.userId === user.id)
        }));

        setCustomers(usersWithAppointments);
      } catch (err) {
        console.error("Error loading customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCustomerData();
  }, []);

  const handleFieldChange = (apptId, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [apptId]: { ...prev[apptId], [field]: value }
    }));
  };

  const handleEditToggle = (appt) => {
    setEditStates((prev) => ({
      ...prev,
      [appt.id]: {
        date: appt.date || "",
        time: appt.time || "",
        reason: appt.reason || ""
      }
    }));
  };

  const handleSave = async (apptId) => {
    const updated = editStates[apptId];
    try {
      const apptRef = doc(db, "appointments", apptId);
      await updateDoc(apptRef, updated);
      setCustomers((prev) =>
        prev.map((cust) => ({
          ...cust,
          appointments: cust.appointments.map((appt) =>
            appt.id === apptId ? { ...appt, ...updated } : appt
          )
        }))
      );
      setEditStates((prev) => {
        const newState = { ...prev };
        delete newState[apptId];
        return newState;
      });
    } catch (err) {
      console.error("Error updating appointment:", err);
    }
  };

  const handleDelete = async (apptId) => {
    try {
      await deleteDoc(doc(db, "appointments", apptId));
      setCustomers((prev) =>
        prev.map((cust) => ({
          ...cust,
          appointments: cust.appointments.filter((appt) => appt.id !== apptId)
        }))
      );
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const handleMarkComplete = async (apptId) => {
    try {
      const apptRef = doc(db, "appointments", apptId);
      await updateDoc(apptRef, { status: "completed" });
      setCustomers((prev) =>
        prev.map((cust) => ({
          ...cust,
          appointments: cust.appointments.map((appt) =>
            appt.id === apptId ? { ...appt, status: "completed" } : appt
          )
        }))
      );
    } catch (err) {
      console.error("Error marking as completed:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <CircularProgress />
        <Typography>Loading all customers...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {customers.map((customer) => {
        const { id, email, name, phone, vehicle = {}, appointments = [] } = customer;
        return (
          <Paper key={id} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              {name || "Unnamed Customer"}
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Email: {email ? <Link href={`mailto:${email}`}>{email}</Link> : "N/A"}
              </Typography>
              <Typography variant="subtitle1">
                Phone: {phone ? <Link href={`tel:${phone}`}>{phone}</Link> : "N/A"}
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Vehicle Info</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography>Make: {vehicle.make || "N/A"}</Typography>
              <Typography>Model: {vehicle.model || "N/A"}</Typography>
              <Typography>Year: {vehicle.year || "N/A"}</Typography>
              <Typography>VIN: {vehicle.vin || "N/A"}</Typography>
              <Typography>Plate: {vehicle.plate || "N/A"}</Typography>
              <Typography>Mileage: {vehicle.mileage || "N/A"}</Typography>
              <Typography>Issues: {vehicle.issues || "None listed"}</Typography>
              <Typography sx={{ mt: 1, color: "secondary.main" }}>
                <strong>Suggested Service:</strong> {getServiceRecommendations(vehicle.mileage)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Appointments</Typography>
            {appointments.length === 0 ? (
              <Typography>No appointments found.</Typography>
            ) : (
              <Stack spacing={2}>
                {appointments.map((appt) => {
                  const isEditing = !!editStates[appt.id];
                  const state = editStates[appt.id] || {};

                  return (
                    <Paper key={appt.id} variant="outlined" sx={{ p: 2 }}>
                      {isEditing ? (
                        <Stack spacing={1}>
                          <TextField
                            type="date"
                            label="Date"
                            InputLabelProps={{ shrink: true }}
                            value={state.date}
                            onChange={(e) => handleFieldChange(appt.id, "date", e.target.value)}
                          />
                          <TextField
                            type="time"
                            label="Time"
                            InputLabelProps={{ shrink: true }}
                            value={state.time}
                            onChange={(e) => handleFieldChange(appt.id, "time", e.target.value)}
                          />
                          <TextField
                            label="Reason"
                            value={state.reason}
                            onChange={(e) => handleFieldChange(appt.id, "reason", e.target.value)}
                          />
                          <Button variant="contained" onClick={() => handleSave(appt.id)}>
                            Save
                          </Button>
                        </Stack>
                      ) : (
                        <>
                          <Typography><strong>Date:</strong> {appt.date || "N/A"}</Typography>
                          <Typography><strong>Time:</strong> {appt.time ? new Date(`1970-01-01T${appt.time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}</Typography>
                          <Typography><strong>Reason:</strong> {appt.reason || "N/A"}</Typography>
                          <Typography><strong>Status:</strong> {appt.status || "pending"}</Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button variant="outlined" onClick={() => handleEditToggle(appt)}>Edit</Button>
                            <Button variant="outlined" color="success" onClick={() => handleMarkComplete(appt.id)}>Mark Complete</Button>
                            <Button variant="outlined" color="error" onClick={() => handleDelete(appt.id)}>Delete</Button>
                          </Stack>
                        </>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default CustomerProfileView;
