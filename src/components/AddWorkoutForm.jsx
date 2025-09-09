import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  fetchExercises,
  fetchTrainees,
  fetchExerciseTypes,
  reportExercise,
  createExerciseType, // quick-add type
  createExercise, // quick-add exercise (sets/reps)
} from "../services/api";


export default function AddWorkoutForm({ defaultTraineeId }) {
  const [trainees, setTrainees] = useState([]);
  const [types, setTypes] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [traineeId, setTraineeId] = useState(defaultTraineeId || "");
  const [workoutDate, setWorkoutDate] = useState(toISO(new Date()));
  const [exerciseTypeId, setExerciseTypeId] = useState("");
  const [exerciseId, setExerciseId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });


  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [creatingType, setCreatingType] = useState(false);

  const [exDialogOpen, setExDialogOpen] = useState(false);
  const [newReps, setNewReps] = useState("");
  const [newSets, setNewSets] = useState("");
  const [creatingExercise, setCreatingExercise] = useState(false);

  const filteredExercises = useMemo(() => {
    if (!exerciseTypeId) return exercises;
    return exercises.filter((e) => e.exerciseTypeId === exerciseTypeId);
  }, [exercises, exerciseTypeId]);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Load trainees if not fixed
        if (!defaultTraineeId) {
          const t = await fetchTrainees();
          if (!mounted) return;
          setTrainees(t || []);
          if (!traineeId && t?.length) setTraineeId(t[0].traineeId);
        }

        // Load types
        const ty = await fetchExerciseTypes();
        if (!mounted) return;
        setTypes(ty || []);
        if (!exerciseTypeId && ty?.length) setExerciseTypeId(ty[0].exerciseTypeId);

        // Load existing exercises
        const ex = await fetchExercises();
        if (!mounted) return;
        setExercises(ex || []);
      } catch (err) {
        openSnack(err.message || "שגיאה בטעינת נתונים", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTraineeId]);

  function openSnack(msg, severity = "success") {
    setSnack({ open: true, msg, severity });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (!traineeId) return openSnack("בחר/י מתאמן", "error");
    if (!workoutDate) return openSnack("בחר/י תאריך אימון", "error");
    if (!exerciseId) return openSnack("בחר/י תרגיל קיים או הוספ/י אחד חדש", "error");

    try {
      setSubmitting(true);
      await reportExercise({ traineeId, exerciseId, workoutDate }); // yyyy-MM-dd
      window.dispatchEvent(new Event("workouts:refresh"));
      openSnack("האימון נוסף בהצלחה 🎉", "success");

      // Reset minimal selection
      setExerciseId("");
      setSubmitted(false);
    } catch (err) {
      openSnack(err.message || "שגיאה בהוספת האימון", "error");
    } finally {
      setSubmitting(false);
    }
  }

  /** Create a new Exercise Type inline (dialog). */
  async function handleCreateType() {
    const name = newTypeName.trim();
    if (!name) return openSnack("שם סוג התרגיל חובה", "error");

    try {
      setCreatingType(true);
      const created = await createExerciseType({ exerciseTypeName: name });

      // Refresh and auto-select new type
      const fresh = await fetchExerciseTypes();
      setTypes(fresh || []);
      setExerciseTypeId(created.exerciseTypeId);

      setTypeDialogOpen(false);
      setNewTypeName("");
      openSnack("סוג תרגיל נוסף בהצלחה", "success");
    } catch (err) {
      openSnack(err.message || "שגיאה בהוספת סוג תרגיל", "error");
    } finally {
      setCreatingType(false);
    }
  }

  /** Create a new Exercise inline (dialog) for the selected type. */
  async function handleCreateExercise() {
    if (!exerciseTypeId) return openSnack("בחר/י קודם סוג תרגיל", "error");

    const repsNum = Number(newReps);
    const setsNum = Number(newSets);

    if (!Number.isFinite(repsNum) || repsNum <= 0) {
      return openSnack("חזרות חייב להיות מספר גדול מאפס", "error");
    }
    if (!Number.isFinite(setsNum) || setsNum <= 0) {
      return openSnack("סטים חייב להיות מספר גדול מאפס", "error");
    }

    try {
      setCreatingExercise(true);

      // Create the exercise
      const created = await createExercise({
        exerciseTypeId,
        repetitions: repsNum,
        sets: setsNum,
      });

      // Refresh list and auto-select
      const ex = await fetchExercises();
      setExercises(ex || []);
      setExerciseId(created.exerciseId);

      setExDialogOpen(false);
      setNewReps("");
      setNewSets("");
      openSnack("תרגיל נוסף בהצלחה", "success");
    } catch (err) {
      openSnack(err.message || "שגיאה בהוספת תרגיל", "error");
    } finally {
      setCreatingExercise(false);
    }
  }

  if (loading) return <p>טוען נתונים…</p>;


  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          הוספת אימון
        </Typography>

        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          {/* Trainee (hidden if fixed) */}
          {!defaultTraineeId && (
            <FormControl fullWidth required error={submitted && !traineeId}>
              <InputLabel id="trainee-label">מתאמן</InputLabel>
              <Select
                labelId="trainee-label"
                label="מתאמן"
                value={traineeId}
                onChange={(e) => setTraineeId(e.target.value)}
                displayEmpty
                renderValue={(val) =>
                  val ? (
                    trainees.find((t) => t.traineeId === val)?.traineeName ?? val
                  ) : (
                    <span style={{ opacity: 0.6 }}>בחר/י מתאמן…</span>
                  )
                }
              >
                <MenuItem value="">
                  <em>בחר/י מתאמן…</em>
                </MenuItem>
                {trainees.map((t) => (
                  <MenuItem key={t.traineeId} value={t.traineeId}>
                    {t.traineeName}
                  </MenuItem>
                ))}
              </Select>
              {submitted && !traineeId && (
                <FormHelperText>שדה חובה</FormHelperText>
              )}
            </FormControl>
          )}

          {/* Workout date */}
          <FormControl fullWidth required error={submitted && !workoutDate}>
            <TextField
              label="תאריך אימון"
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            {submitted && !workoutDate && (
              <FormHelperText>שדה חובה</FormHelperText>
            )}
          </FormControl>

          {/* Exercise type + quick-add */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl fullWidth required error={submitted && !exerciseTypeId}>
              <InputLabel id="type-label">סוג תרגיל</InputLabel>
              <Select
                labelId="type-label"
                label="סוג תרגיל"
                value={exerciseTypeId}
                onChange={(e) => {
                  setExerciseTypeId(e.target.value);
                  setExerciseId(""); // reset exercise when changing type
                }}
                displayEmpty
                renderValue={(val) => {
                  if (!val) return <span style={{ opacity: 0.6 }}>בחר/י סוג תרגיל…</span>;
                  const t = types.find((x) => x.exerciseTypeId === val);
                  return t?.exerciseTypeName ?? val;
                }}
              >
                <MenuItem value="">
                  <em>בחר/י סוג תרגיל…</em>
                </MenuItem>
                {types.map((t) => (
                  <MenuItem key={t.exerciseTypeId} value={t.exerciseTypeId}>
                    {t.exerciseTypeName}
                  </MenuItem>
                ))}
              </Select>
              {submitted && !exerciseTypeId && (
                <FormHelperText>שדה חובה</FormHelperText>
              )}
            </FormControl>

            <Button variant="outlined" onClick={() => setTypeDialogOpen(true)}>
              הוסף סוג תרגיל חדש
            </Button>
          </Stack>

          {/* Exercise picker + quick-add */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl fullWidth required error={submitted && !exerciseId}>
              <InputLabel id="exercise-label">תרגיל קיים</InputLabel>
              <Select
                labelId="exercise-label"
                label="תרגיל קיים"
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
                displayEmpty
                renderValue={(val) => {
                  if (!val) return <span style={{ opacity: 0.6 }}>בחר/י תרגיל…</span>;
                  const ex = filteredExercises.find((x) => x.exerciseId === val);
                  if (!ex) return val;
                  const name =
                    ex.exerciseType?.exerciseTypeName ||
                    ex.exerciseTypeId ||
                    "תרגיל";
                  return `${name} — סטים: ${ex.sets}, חזרות: ${ex.repetitions}`;
                }}
              >
                <MenuItem value="">
                  <em>בחר/י תרגיל…</em>
                </MenuItem>
                {filteredExercises.map((ex) => (
                  <MenuItem key={ex.exerciseId} value={ex.exerciseId}>
                    {(ex.exerciseType?.exerciseTypeName ||
                      ex.exerciseTypeId ||
                      "תרגיל") +
                      ` — סטים: ${ex.sets}, חזרות: ${ex.repetitions}`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                ניתן להוסיף תרגיל חדש (סטים/חזרות) בלחיצה על הכפתור משמאל.
              </FormHelperText>
              {submitted && !exerciseId && (
                <FormHelperText error>שדה חובה</FormHelperText>
              )}
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => setExDialogOpen(true)}
              disabled={!exerciseTypeId}
              title={!exerciseTypeId ? "בחר/י קודם סוג תרגיל" : ""}
            >
              הוסף תרגיל חדש (סטים/חזרות)
            </Button>
          </Stack>

          <Box>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "שולח…" : "דיווח אימון"}
            </Button>
          </Box>
        </Stack>
      </CardContent>

      {/* Dialog: quick-add Exercise Type */}
      <Dialog open={typeDialogOpen} onClose={() => setTypeDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>הוספת סוג תרגיל</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם סוג תרגיל"
            fullWidth
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            disabled={creatingType}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTypeDialogOpen(false)} disabled={creatingType} variant="outlined">
            ביטול
          </Button>
          <Button onClick={handleCreateType} disabled={creatingType} variant="contained">
            {creatingType ? "יוצר…" : "צור סוג"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: quick-add Exercise (sets/reps) */}
      <Dialog open={exDialogOpen} onClose={() => setExDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>הוספת תרגיל חדש</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="חזרות (repetitions)"
              type="number"
              inputProps={{ min: 1 }}
              value={newReps}
              onChange={(e) => setNewReps(e.target.value)}
              disabled={creatingExercise}
              fullWidth
            />
            <TextField
              label="סטים (sets)"
              type="number"
              inputProps={{ min: 1 }}
              value={newSets}
              onChange={(e) => setNewSets(e.target.value)}
              disabled={creatingExercise}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExDialogOpen(false)} disabled={creatingExercise} variant="outlined">
            ביטול
          </Button>
          <Button onClick={handleCreateExercise} disabled={creatingExercise} variant="contained">
            {creatingExercise ? "יוצר…" : "צור תרגיל"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Card>
  );
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
}
