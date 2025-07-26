import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  Box,
  Divider,
  Alert
} from "@mui/material";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  saveUserProfile,
  signInWithGoogle,
  getUserProfile,
  sendPasswordResetEmail
} from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const userEmail = userCred.user.email;

        const assignedRole = userEmail === "protocolnetwork18052687686@gmail.com" ? "mechanic" : "customer";

        await saveUserProfile(userCred.user.uid, {
          email: userEmail,
          role: assignedRole,
          vehicle: {}
        });

        navigate(assignedRole === "mechanic" ? "/mechanic-dashboard" : "/dashboard");
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(userCred.user.uid);

        if (!profile?.role) {
          setMessage("❗ Your role is not assigned. Please contact support.");
        } else {
          navigate(profile.role === "mechanic" ? "/mechanic-dashboard" : "/dashboard");
        }
      }
    } catch (err) {
      console.error("🔴 Auth error:", err.message);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await signInWithGoogle();
      const { user } = result;

      const existing = await getUserProfile(user.uid);
      if (!existing) {
        const assignedRole = user.email === "protocolnetwork18052687686@gmail.com" ? "mechanic" : "customer";
        await saveUserProfile(user.uid, {
          email: user.email,
          role: assignedRole,
          vehicle: {}
        });
        navigate(assignedRole === "mechanic" ? "/mechanic-dashboard" : "/dashboard");
      } else {
        navigate(existing.role === "mechanic" ? "/mechanic-dashboard" : "/dashboard");
      }
    } catch (err) {
      console.error("🔴 Google sign-in error:", err.message);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📩 A password reset link has been sent to your email.");
    } catch (err) {
      console.error("🔴 Reset error:", err.message);
      setMessage(err.message);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Protocol Networks
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Let's get you on the road.
      </Typography>

      <Paper sx={{ maxWidth: 400, mx: "auto", p: 4 }}>
        <Typography variant="h6" gutterBottom>
          {isSignup ? "Sign Up" : "Login"}
        </Typography>

        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {!isSignup && (
              <Button
                type="button"
                onClick={handleForgotPassword}
                sx={{ alignSelf: "flex-start", textTransform: "none", fontSize: 14 }}
              >
                Forgot password?
              </Button>
            )}

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
            </Button>

            <Button type="button" onClick={() => setIsSignup(!isSignup)}>
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </Button>

            <Divider>or</Divider>

            <Button
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Sign in with Google
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
