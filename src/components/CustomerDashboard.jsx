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
  collection,
  getDocs,
  updateDoc,
  signOut
} from "../firebase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const MechanicDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const userSnap = await getDocs(collection(db, "users"));
        const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const apptSnap = await getDocs(collection(db, "appointments"));
        const appointments = apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const merged = users.map(user => ({
          ...user,
          appointments: appointments.filter(a => a.userId === user.id)
        }));

        setCustomers(merged);
      } catch (error) {
        console.error("❌ Failed to fetch customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Paper sx={{ p: 3, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center" }}>
        <Typography variant="h6">Mechanic Dashboard</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout</Button>
      </Paper>

      {loading ? (
        <Typography sx={{ mt: 4 }}>Loading customers...</Typography>
      ) : (
        customers.map((cust, index) => (
          <Paper key={index} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6">{cust.name || "Unnamed Customer"}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography><strong>Phone:</strong> {cust.phone || "N/A"}</Typography>
              <Typography><strong>Email:</strong> {cust.email || "N/A"}</Typography>
              <Typography><strong>Vehicle:</strong> {cust.vehicle?.year || ""} {cust.vehicle?.make || ""} {cust.vehicle?.model || ""}</Typography>
              <Typography><strong>Plate:</strong> {cust.vehicle?.plate || "N/A"}</Typography>
              <Typography><strong>VIN:</strong> {cust.vehicle?.vin || "N/A"}</Typography>
              <Typography><strong>Mileage:</strong> {cust.vehicle?.mileage || "N/A"}</Typography>
              <Typography><strong>Issues:</strong> {cust.vehicle?.issues || "None listed"}</Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Appointments</Typography>
            {cust.appointments.length === 0 ? (
              <Typography>No appointments yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {cust.appointments.map(appt => (
                  <Paper key={appt.id} sx={{ p: 2 }}>
                    <Typography><strong>Date:</strong> {appt.date}</Typography>
                    <Typography><strong>Time:</strong> {appt.time}</Typography>
                    <Typography><strong>Reason:</strong> {appt.reason}</Typography>
                    <Typography><strong>Status:</strong> {appt.status || "Pending"}</Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        ))
      )}
    </Box>
  );
};

export default MechanicDashboard;