import { useEffect, useState } from "react";
import {
  fetchExerciseTypes,
  updateExerciseType,
  deleteExerciseType,
} from "../services/api";
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

export default function ExerciseTypeList() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchExerciseTypes();
        setTypes(list || []);
      } catch (err) {
        openSnack(err.message || "שגיאה בטעינת סוגי תרגילים", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function startEdit(t) {
    setEditingId(t.exerciseTypeId);
    setFormName(t.exerciseTypeName || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setFormName("");
  }

  async function saveEdit(id) {
    const name = formName.trim();
    if (!name) return openSnack("שם סוג התרגיל חובה", "error");
    try {
      setSaving(true);
      await updateExerciseType(id, { exerciseTypeName: name });
      setTypes((prev) =>
        prev.map((t) => (t.exerciseTypeId === id ? { ...t, exerciseTypeName: name } : t))
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
    const prev = types;
    setTypes(prev.filter((t) => t.exerciseTypeId !== id));
    closeConfirm();
    try {
      await deleteExerciseType(id);
      openSnack("נמחק בהצלחה", "success");
    } catch (err) {
      setTypes(prev); // rollback
      openSnack(err.message || "שגיאה במחיקה", "error");
    }
  }

  function openSnack(msg, severity = "success") {
    setSnack({ open: true, msg, severity });
  }

  if (loading) return <p>טוען סוגי תרגילים…</p>;
  if (!types.length) return <p>אין סוגי תרגילים להצגה.</p>;

  return (
    <Box>
      <List disablePadding>
        {types.map((t) => {
          const isEditing = editingId === t.exerciseTypeId;
          return (
            <ListItem
              key={t.exerciseTypeId}
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
                        <IconButton onClick={() => confirmDelete(t.exerciseTypeId)} edge="end">
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                ) : null
              }
            >
              {isEditing ? (
                <TypeEditForm
                  name={formName}
                  onNameChange={setFormName}
                  onSave={() => saveEdit(t.exerciseTypeId)}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ) : (
                <ListItemText primary={<strong>{t.exerciseTypeName}</strong>} />
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>מחיקת סוג תרגיל</DialogTitle>
        <DialogContent>
          <DialogContentText>
            למחוק את סוג התרגיל הזה? יתכן וקיימים תרגילים שמשתמשים בו.
          </DialogContentText>
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

function TypeEditForm({ name, onNameChange, onSave, onCancel, saving }) {
  return (
    <Stack spacing={1} sx={{ width: "100%", pr: 1 }}>
      <TextField
        label="שם סוג תרגיל"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
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
