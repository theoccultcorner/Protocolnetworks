import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider
} from "@mui/material";
import { db, collection, getDocs } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const apptSnap = await getDocs(collection(db, "appointments"));
        const apptList = apptSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(apptList);
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mechanic Dashboard
      </Typography>

      {loading ? (
        <Typography>Loading appointments...</Typography>
      ) : appointments.length === 0 ? (
        <Typography>No appointments found.</Typography>
      ) : (
        <Stack spacing={3}>
          {appointments.map((appt) => (
            <Paper key={appt.id} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer: {appt.name || "N/A"} ({appt.phone || "N/A"})
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography><strong>Date:</strong> {appt.date || "N/A"}</Typography>
              <Typography><strong>Time:</strong> {appt.time || "N/A"}</Typography>
              <Typography><strong>Reason:</strong> {appt.reason || "N/A"}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Vehicle Information:
              </Typography>
              <Typography><strong>Make:</strong> {appt.vehicle?.make || "N/A"}</Typography>
              <Typography><strong>Model:</strong> {appt.vehicle?.model || "N/A"}</Typography>
              <Typography><strong>Year:</strong> {appt.vehicle?.year || "N/A"}</Typography>
              <Typography><strong>VIN:</strong> {appt.vehicle?.vin || "N/A"}</Typography>
              <Typography><strong>License Plate:</strong> {appt.vehicle?.plate || "N/A"}</Typography>
              <Typography><strong>Mileage:</strong> {appt.vehicle?.mileage || "N/A"}</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
                <strong>Issues:</strong> {appt.vehicle?.issues?.trim() || "None listed"}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MechanicDashboard;
