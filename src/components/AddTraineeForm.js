import { useState } from "react";
import { createTrainee } from "../services/api";
import { Box, Button, Stack, TextField, Snackbar, Alert } from "@mui/material";


export default function AddTraineeForm({ onCreated }) {
  const [traineeName, setTraineeName] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  async function handleSubmit(e) {
    e.preventDefault();

    if (!traineeName.trim()) {
      return openSnack("שם מתאמן חובה", "error");
    }
    if (!password || password.length < 8) {
      return openSnack("סיסמה חייבת להיות לפחות 8 תווים", "error");
    }

    try {
      setSubmitting(true);
      const created = await createTrainee({ traineeName: traineeName.trim(), password });
      openSnack("המתאמן נוסף בהצלחה 🎉", "success");
      setTraineeName("");
      setPassword("");
      if (typeof onCreated === "function") onCreated(created);
    } catch (err) {
      openSnack(err.message || "שגיאה בהוספה", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function openSnack(msg, severity = "success") {
    setSnack({ open: true, msg, severity });
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="שם מתאמן"
          value={traineeName}
          onChange={(e) => setTraineeName(e.target.value)}
          disabled={submitting}
          fullWidth
        />
        <TextField
          label="סיסמה (לפחות 8 תווים)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          fullWidth
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "שומר…" : "הוסף מתאמן"}
        </Button>
      </Stack>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
