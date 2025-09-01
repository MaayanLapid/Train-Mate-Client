import { useEffect, useState } from "react";
import { fetchExercises, updateExercise, deleteExerciseApi } from "../services/api";
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

export default function ExercisesList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [formReps, setFormReps] = useState("");
  const [formSets, setFormSets] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchExercises();
        setExercises(list || []);
      } catch (err) {
        openSnack(err.message || "שגיאה בטעינת תרגילים", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function startEdit(ex) {
    setEditingId(ex.exerciseId);
    setFormReps(String(ex.repetitions ?? ""));
    setFormSets(String(ex.sets ?? ""));
  }

  function cancelEdit() {
    setEditingId(null);
    setFormReps("");
    setFormSets("");
  }

  async function saveEdit(id) {
    const repsNum = Number(formReps);
    const setsNum = Number(formSets);
    if (!Number.isFinite(repsNum) || repsNum <= 0) {
      return openSnack("חזרות חייב להיות מספר גדול מאפס", "error");
    }
    if (!Number.isFinite(setsNum) || setsNum <= 0) {
      return openSnack("סטים חייב להיות מספר גדול מאפס", "error");
    }

    try {
      setSaving(true);
      await updateExercise(id, { repetitions: repsNum, sets: setsNum });
      setExercises((prev) =>
        prev.map((ex) =>
          ex.exerciseId === id ? { ...ex, repetitions: repsNum, sets: setsNum } : ex
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
    const prev = exercises;
    setExercises(prev.filter((ex) => ex.exerciseId !== id));
    closeConfirm();
    try {
      await deleteExerciseApi(id);
      openSnack("נמחק בהצלחה", "success");
    } catch (err) {
      setExercises(prev); // rollback
      openSnack(err.message || "שגיאה במחיקה", "error");
    }
  }

  function openSnack(msg, severity = "success") {
    setSnack({ open: true, msg, severity });
  }

  if (loading) return <p>טוען תרגילים…</p>;
  if (!exercises.length) return <p>אין תרגילים להצגה.</p>;

  return (
    <Box>
      <List disablePadding>
        {exercises.map((ex) => {
          const typeName = ex.exerciseType?.exerciseTypeName ?? "סוג לא ידוע";
          const isEditing = editingId === ex.exerciseId;

          return (
            <ListItem
              key={ex.exerciseId}
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
                        <IconButton onClick={() => startEdit(ex)} edge="end">
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="מחיקה">
                      <span>
                        <IconButton onClick={() => confirmDelete(ex.exerciseId)} edge="end">
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                ) : null
              }
            >
              {isEditing ? (
                <ExerciseEditForm
                  typeName={typeName}
                  reps={formReps}
                  sets={formSets}
                  onRepsChange={setFormReps}
                  onSetsChange={setFormSets}
                  onSave={() => saveEdit(ex.exerciseId)}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ) : (
                <ListItemText
                  primary={<strong>{typeName}</strong>}
                  secondary={
                    <span style={{ opacity: 0.8 }}>
                      סטים: {ex.sets}, חזרות: {ex.repetitions}
                    </span>
                  }
                />
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>מחיקת תרגיל</DialogTitle>
        <DialogContent>
          <DialogContentText>למחוק את התרגיל הזה? הפעולה אינה הפיכה.</DialogContentText>
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

function ExerciseEditForm({
  typeName,
  reps,
  sets,
  onRepsChange,
  onSetsChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <Stack spacing={1} sx={{ width: "100%", pr: 1 }}>
      <strong>{typeName}</strong>
      <Stack direction="row" spacing={1}>
        <TextField
          label="חזרות"
          type="number"
          inputProps={{ min: 1 }}
          value={reps}
          onChange={(e) => onRepsChange(e.target.value)}
          disabled={saving}
          sx={{ maxWidth: 140 }}
        />
        <TextField
          label="סטים"
          type="number"
          inputProps={{ min: 1 }}
          value={sets}
          onChange={(e) => onSetsChange(e.target.value)}
          disabled={saving}
          sx={{ maxWidth: 140 }}
        />
      </Stack>
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
