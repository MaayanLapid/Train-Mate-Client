import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchTrainees } from "../services/api";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";

export default function LoginPage() {
  const { auth, login } = useAuth();
  const [tab, setTab] = useState(0); // 0=client, 1=admin

  // Client state
  const [trainees, setTrainees] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientPass, setClientPass] = useState("");
  const [loadingTrainees, setLoadingTrainees] = useState(true);

  // Admin state
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // UI
  const [error, setError] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    // Load trainees only when on "client" tab
    let mounted = true;
    (async () => {
      if (tab !== 0) {
        setLoadingTrainees(false);
        return;
      }
      try {
        setLoadingTrainees(true);
        const list = await fetchTrainees();
        if (!mounted) return;
        setTrainees(list || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load trainees");
        setSnackOpen(true);
      } finally {
        if (!mounted) return;
        setLoadingTrainees(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tab]);

  function handleTabChange(_, newValue) {
    setTab(newValue);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (tab === 1) {
        if (adminUser.trim().toLowerCase() === "admin" && adminPass.length >= 4) {
        login({ role: "admin", traineeId: null, traineeName: "Admin" });
        return;
      }
      setError("Invalid admin credentials (demo). Try user: admin, pass: any >= 4 chars");
      setSnackOpen(true);
      return;
    }

    const t = trainees.find((x) => x.traineeName === clientName);
    if (!t) {
      setError("Trainee not found");
      setSnackOpen(true);
      return;
    }
    if (t.password !== clientPass) {
      setError("Wrong password");
      setSnackOpen(true);
      return;
    }

    login({ role: "client", traineeId: t.traineeId, traineeName: t.traineeName });
  }

  if (auth) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="info">את/ה כבר מחובר/ת. ניתן לעבור בתפריט לעמוד המתאים.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            התחברות
          </Typography>

          <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
            <Tab label="לקוח" />
            <Tab label="אדמין" />
          </Tabs>

          <Box component="form" onSubmit={handleSubmit}>
            {tab === 1 ? (
              <Stack spacing={2}>
                <TextField
                  label="Admin user"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Admin password"
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  fullWidth
                />
              </Stack>
            ) : (
              <Stack spacing={2}>
                <TextField
                  label="שם מתאמן"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  fullWidth
                  disabled={loadingTrainees}
                  helperText={loadingTrainees ? "טוען מתאמנים…" : "הקלד את שמך כפי שנוצר במערכת"}
                />
                <TextField
                  label="סיסמה"
                  type="password"
                  value={clientPass}
                  onChange={(e) => setClientPass(e.target.value)}
                  fullWidth
                  disabled={loadingTrainees}
                />
              </Stack>
            )}
            <CardActions sx={{ mt: 2, justifyContent: "flex-end" }}>
              <Button type="submit">התחברות</Button>
            </CardActions>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}>
        {error ? <Alert onClose={() => setSnackOpen(false)} severity="error">{error}</Alert> : null}
      </Snackbar>
    </Container>
  );
}
