import { useEffect, useState } from "react";
import { fetchTrainees, updateTrainee, deleteTrainee } from "../services/api";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TraineeList() {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTrainees();
        setTrainees(list || []);
      } catch (err) {
        openSnack(err.message || "שגיאה בטעינת מתאמנים", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function startEdit(t) {
    setEditingId(t.traineeId);
    setFormName(t.traineeName || "");
    setFormPassword(t.password || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setFormName("");
    setFormPassword("");
  }

  async function saveEdit(id) {
    if (!formName.trim()) return openSnack("שם מתאמן חובה", "error");
    if (!formPassword || formPassword.length < 8) {
      return openSnack("סיסמה חייבת להיות לפחות 8 תווים", "error");
    }

    try {
      setSaving(true);
      await updateTrainee(id, { traineeName: formName.trim(), password: formPassword });
      setTrainees((prev) =>
        prev.map((t) =>
          t.traineeId === id ? { ...t, traineeName: formName.trim(), password: formPassword } : t
        )
      );
      openSnack("נשמר בהצלחה", "success");
      cancelEdit();
    } catch (err) {
      openSnack(err.message || "שגיאה בשמירה", "error");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(id) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  async function doDelete() {
    const id = pendingDeleteId;
    if (!id) return;
    const prev = trainees;
    setTrainees(prev.filter((t) => t.traineeId !== id));
    closeConfirm();
    try {
      await deleteTrainee(id);
      openSnack("נמחק בהצלחה", "success");
    } catch (err) {
      setTrainees(prev); // rollback
      openSnack(err.message || "שגיאה במחיקה", "error");
    }
  }

  function openSnack(msg, severity = "success") {
    setSnack({ open: true, msg, severity });
  }

  if (loading) return <p>טוען מתאמנים…</p>;
  if (!trainees.length) return <p>אין מתאמנים להצגה.</p>;

  return (
    <Box>
      <List disablePadding>
        {trainees.map((t) => {
          const isEditing = editingId === t.traineeId;
          return (
            <ListItem
              key={t.traineeId}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                mb: 1,
                alignItems: "flex-start",
              }}
              secondaryAction={
                !isEditing ? (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="עריכה">
                      <span>
                        <IconButton onClick={() => startEdit(t)} edge="end">
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="מחיקה">
                      <span>
                        <IconButton onClick={() => confirmDelete(t.traineeId)} edge="end">
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                ) : null
              }
            >
              {isEditing ? (
                <EditForm
                  name={formName}
                  password={formPassword}
                  onNameChange={setFormName}
                  onPassChange={setFormPassword}
                  onSave={() => saveEdit(t.traineeId)}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ) : (
                <ListItemText
                  primary={<strong>{t.traineeName}</strong>}
                  secondary={<span style={{ opacity: 0.75 }}>סיסמה: {t.password}</span>}
                />
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>מחיקת מתאמן</DialogTitle>
        <DialogContent>
          <DialogContentText>למחוק את המתאמן הזה? הפעולה אינה הפיכה.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} variant="outlined">ביטול</Button>
          <Button onClick={doDelete} color="error" variant="contained">מחק</Button>
        </DialogActions>
      </Dialog>

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

function EditForm({
  name,
  password,
  onNameChange,
  onPassChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <Stack spacing={1} sx={{ width: "100%", pr: 1 }}>
      <TextField
        label="שם מתאמן"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        disabled={saving}
        fullWidth
      />
      <TextField
        label="סיסמה"
        type="password"
        value={password}
        onChange={(e) => onPassChange(e.target.value)}
        disabled={saving}
        fullWidth
      />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? "שומר…" : "שמירה"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          ביטול
        </Button>
      </Stack>
    </Stack>
  );
}
