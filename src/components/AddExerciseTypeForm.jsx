import { useState } from "react";
import { createExerciseType } from "../services/api";
import { Box, Button, Stack, TextField, Snackbar, Alert } from "@mui/material";


export default function AddExerciseTypeForm({ onCreated }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return openSnack("שם סוג התרגיל חובה", "error");

    try {
      setSubmitting(true);
      const created = await createExerciseType({ exerciseTypeName: name.trim() });
      setName("");
      openSnack("סוג תרגיל נוסף בהצלחה 🎉", "success");
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
          label="שם סוג תרגיל"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          fullWidth
          placeholder="לדוגמה: סקוואט"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "שומר…" : "הוסף סוג"}
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
