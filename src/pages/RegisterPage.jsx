import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchTrainees, createTrainee } from "../services/api";

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

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Form state
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "error" });

    function openSnack(msg, severity = "error") {
        setSnack({ open: true, msg, severity });
    }

    async function handleSubmit(e) {
        e.preventDefault();


        if (!name.trim()) return openSnack("שם מתאמן חובה");
        if (!password || password.length < 8) return openSnack("סיסמה חייבת להיות לפחות 8 תווים");

        try {
            setLoading(true);

            const existing = await fetchTrainees();
            const exists = (existing || []).some(
                (t) => t.traineeName?.trim().toLowerCase() === name.trim().toLowerCase()
            );
            if (exists) {
                openSnack("שם המתאמן כבר קיים, בחר/י שם אחר");
                return;
            }

            // Create trainee
            const created = await createTrainee({
                traineeName: name.trim(),
                password,
            });

            // Auto-login as client
            login({
                id: created?.traineeId ?? "me",
                name: created?.traineeName ?? name.trim(),
                role: "client",
            });

            openSnack("נרשמת בהצלחה! ברוך/ה הבא/ה 🎉", "success");
            navigate("/me", { replace: true });
        } catch (err) {
            openSnack(err?.message || "שגיאה בהרשמה");
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
                            הרשמה ל־TrainMate
                        </Typography>

                        <TextField
                            label="שם מתאמן"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="username"
                            fullWidth
                            disabled={loading}
                        />

                        <TextField
                            label="סיסמה (לפחות 8 תווים)"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            fullWidth
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={18} /> : null}
                        >
                            {loading ? "שולח…" : "צור חשבון"}
                        </Button>

                        <Typography variant="body2" align="center">
                            כבר יש לך חשבון?{" "}
                            <Link component={RouterLink} to="/login">
                                התחבר/י כאן
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
