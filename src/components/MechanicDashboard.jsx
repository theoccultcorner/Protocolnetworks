import React, { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MechanicDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const customerList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const v = data.vehicle || {};
            const mileage = parseInt(v.mileage || 0);
            let recommendedServices = [];

            if (mileage >= 3000 && mileage < 10000) {
              recommendedServices.push("Oil change");
            }
            if (mileage >= 15000) {
              recommendedServices.push("Check air filter", "Rotate tires");
            }
            if (mileage >= 30000) {
              recommendedServices.push("Inspect brake pads", "Flush transmission fluid");
            }
            if (mileage >= 60000) {
              recommendedServices.push("Check timing belt", "Inspect suspension");
            }

            return {
              id: doc.id,
              ...data,
              vehicle: {
                ...v,
                recommendedServices
              }
            };
          })
          .filter((user) => user.role === "customer");

        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleViewCustomer = (id) => {
    navigate(`/customer/${id}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Mechanic Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          View customer profiles and diagnostics
        </Typography>

        <List>
          {customers.map((customer) => {
            const v = customer.vehicle || {};
            return (
              <React.Fragment key={customer.id}>
                <ListItem
                  disablePadding
                  alignItems="flex-start"
                  secondaryAction={
                    <ListItemButton onClick={() => handleViewCustomer(customer.id)}>
                      <Typography variant="button">View</Typography>
                    </ListItemButton>
                  }
                >
                  <ListItemText
                    primary={
                      <>
                        {customer.name || "Unnamed Customer"} —{" "}
                        <Typography component="span" variant="body2" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Phone:
                        </Typography>{" "}
                        {customer.phone || "N/A"} <br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Vehicle:
                        </Typography>{" "}
                        {v.year || "?"} {v.make || ""} {v.model || ""} (VIN: {v.vin || "N/A"})<br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Mileage:
                        </Typography>{" "}
                        {v.mileage || "N/A"}<br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Issue:
                        </Typography>{" "}
                        {v.issues || "No issues described yet."}<br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Recommended Services:
                        </Typography>{" "}
                        {v.recommendedServices?.length > 0
                          ? v.recommendedServices.join(", ")
                          : "No services due"}
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default MechanicDashboard;