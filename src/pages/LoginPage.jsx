import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchTrainees } from "../services/api";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";


export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "error" });

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin", { replace: true });
    else if (user.role === "client") navigate("/me", { replace: true });
  }, [user, navigate]);

  function openSnack(msg, severity = "error") {
    setSnack({ open: true, msg, severity });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password) {
      return openSnack("חובה להזין שם משתמש וסיסמה");
    }

    try {
      setLoading(true);


      if (username.trim().toLowerCase() === "admin") {
        if (password.length >= 8) {
          login({ id: "admin", name: "Admin", role: "admin" });
          openSnack("ברוך הבא, אדמין!", "success");
          navigate("/admin", { replace: true });
          return;
        } else {
          openSnack("סיסמת אדמין חייבת להיות לפחות 8 תווים");
          return;
        }
      }


      const trainees = await fetchTrainees();
      const found = (trainees || []).find(
        (t) =>
          t.traineeName?.trim().toLowerCase() === username.trim().toLowerCase() &&
          String(t.password) === String(password)
      );

      if (!found) {
        openSnack("שם משתמש או סיסמה שגויים");
        return;
      }

      // Save user to auth context and go to client page
      login({
        id: found.traineeId,
        name: found.traineeName,
        role: "client",
      });

      openSnack("התחברת בהצלחה!", "success");
      navigate("/me", { replace: true });
    } catch (err) {
      openSnack(err?.message || "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <Typography variant="h5" align="center" gutterBottom>
              התחברות ל־TrainMate
            </Typography>

            <TextField
              label="שם משתמש"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              fullWidth
              disabled={loading}
            />

            <TextField
              label="סיסמה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              {loading ? "מתחבר…" : "התחבר"}
            </Button>

            <Typography variant="body2" align="center">
              אין לך משתמש?{" "}
              <Link component={RouterLink} to="/register">
                צור חשבון חדש
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
