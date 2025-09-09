import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import {
  fetchTrainees,
  fetchWorkouts,
  fetchWorkoutById,
} from "../services/api";

export default function WorkoutsList({ fixedTraineeId }) {
  const [trainees, setTrainees] = useState([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState(fixedTraineeId || "");

  const [workouts, setWorkouts] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(!fixedTraineeId);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [error, setError] = useState(null);


  const { startISO, endISO } = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const start = new Date(now - 30 * day);
    const end = new Date(now + 30 * day);
    return { startISO: toISO(start), endISO: toISO(end) };
  }, []);


  useEffect(() => {
    if (fixedTraineeId) {
      setSelectedTraineeId(fixedTraineeId);
      setLoadingTrainees(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoadingTrainees(true);
        const list = await fetchTrainees();
        if (!mounted) return;
        setTrainees(list || []);
        if (!selectedTraineeId && list?.length) {
          setSelectedTraineeId(list[0].traineeId);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load trainees");
      } finally {
        if (mounted) setLoadingTrainees(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedTraineeId]);

  const loadWorkouts = useCallback(async () => {
    if (!selectedTraineeId) return;
    try {
      setError(null);
      setLoadingWorkouts(true);

      const list = (await fetchWorkouts({
        traineeId: selectedTraineeId,
        start: startISO,
        end: endISO,
      })) || [];

      const detailed = await Promise.all(
        list.map(async (w) => {
          try {
            return await fetchWorkoutById(w.workoutId);
          } catch {
            return w; // fallback to raw
          }
        })
      );

      setWorkouts(detailed);
    } catch (err) {
      setError(err.message || "Failed to load workouts");
      setWorkouts([]);
    } finally {
      setLoadingWorkouts(false);
    }
  }, [selectedTraineeId, startISO, endISO]);

  // load when trainee changes
  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // optional: global refresh hook (e.g., fired by AddWorkoutForm after submit)
  useEffect(() => {
    function onRefresh() {
      loadWorkouts();
    }
    window.addEventListener("workouts:refresh", onRefresh);
    return () => window.removeEventListener("workouts:refresh", onRefresh);
  }, [loadWorkouts]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" align="center">
        אימונים
      </Typography>

      {/* Trainee picker (hidden if fixed) */}
      {!fixedTraineeId && (
        <FormControl fullWidth disabled={loadingTrainees}>
          <InputLabel id="trainee-label">בחר מתאמן</InputLabel>
          <Select
            labelId="trainee-label"
            label="בחר מתאמן"
            value={selectedTraineeId}
            onChange={(e) => setSelectedTraineeId(e.target.value)}
          >
            {!trainees.length && <MenuItem value="">אין מתאמנים</MenuItem>}
            {trainees.map((t) => (
              <MenuItem key={t.traineeId} value={t.traineeId}>
                {t.traineeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {error && <Alert severity="error">שגיאה: {error}</Alert>}

      {loadingWorkouts ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : !workouts.length ? (
        <Typography align="center" sx={{ opacity: 0.8 }}>
          אין אימונים להצגה.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {workouts.map((w) => {
            const dateLabel = formatDate(w.workoutDate ?? w.date);
            const exercises = w.exercises ?? [];
            const traineeName = w.trainee?.traineeName;

            return (
              <Card key={w.workoutId} variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="baseline"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Typography variant="h6">Workout: {w.workoutId}</Typography>
                      <Typography variant="body2">תאריך: {dateLabel}</Typography>
                    </Stack>

                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      מתאמן: {traineeName ? `${traineeName} ` : ""}
                      <span style={{ opacity: 0.7 }}>({w.traineeId})</span>
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">תרגילים:</Typography>
                      <Chip size="small" label={exercises.length} />
                    </Stack>

                    {!!exercises.length && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <List dense sx={{ py: 0 }}>
                          {exercises.map((ex) => {
                            const name =
                              ex.exerciseType?.exerciseTypeName ||
                              ex.exerciseTypeId ||
                              "תרגיל";

                            return (
                              <ListItem
                                key={ex.exerciseId}
                                sx={{
                                  border: "1px solid #eee",
                                  borderRadius: 1,
                                  mb: 0.5,
                                }}
                              >
                                <ListItemText
                                  primary={name}
                                  secondary={`סטים: ${ex.sets ?? "—"}, חזרות: ${ex.repetitions ?? "—"
                                    }`}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

// yyyy-MM-dd
function toISO(d) {
  return d.toISOString().slice(0, 10);
}

// Pretty date for UI
function formatDate(isoOrNull) {
  if (!isoOrNull) return "—";
  const d = new Date(isoOrNull);
  if (isNaN(d)) return isoOrNull;
  return d.toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
