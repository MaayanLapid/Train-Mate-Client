import { useEffect, useState } from "react";
import { fetchExerciseTypes, createExercise } from "../services/api";
import {
    Alert,
    Box,
    Button,
    MenuItem,
    Snackbar,
    Stack,
    TextField,
} from "@mui/material";


export default function AddExerciseForm({ onCreated, refreshTypesKey }) {
    // Reference data
    const [types, setTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);

    // Form fields
    const [exerciseTypeId, setExerciseTypeId] = useState("");
    const [repetitions, setRepetitions] = useState("");
    const [sets, setSets] = useState("");

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

    // Load exercise types (on mount and when refreshTypesKey changes)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingTypes(true);
                const list = await fetchExerciseTypes();
                if (!mounted) return;

                setTypes(list || []);
                // Preselect first type if none selected
                if ((list?.length ?? 0) > 0 && !exerciseTypeId) {
                    setExerciseTypeId(list[0].exerciseTypeId);
                }
            } catch (err) {
                if (!mounted) return;
                openSnack(err.message || "שגיאה בטעינת סוגי התרגילים", "error");
            } finally {
                if (!mounted) return;
                setLoadingTypes(false);
            }
        })();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTypesKey]);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!exerciseTypeId) return openSnack("בחר סוג תרגיל", "error");

        const repsNum = Number(repetitions);
        const setsNum = Number(sets);
        if (!Number.isFinite(repsNum) || repsNum <= 0) {
            return openSnack("מספר חזרות חייב להיות גדול מאפס", "error");
        }
        if (!Number.isFinite(setsNum) || setsNum <= 0) {
            return openSnack("מספר סטים חייב להיות גדול מאפס", "error");
        }

        try {
            setSubmitting(true);
            const created = await createExercise({
                exerciseTypeId,
                repetitions: repsNum,
                sets: setsNum,
            });

            openSnack("התרגיל נוסף בהצלחה 🎉", "success");
            setRepetitions("");
            setSets("");

            if (typeof onCreated === "function") onCreated(created);
        } catch (err) {
            openSnack(err.message || "שגיאה בהוספת התרגיל", "error");
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
                {/* Exercise type select */}
                <TextField
                    select
                    label="סוג תרגיל"
                    value={exerciseTypeId}
                    onChange={(e) => setExerciseTypeId(e.target.value)}
                    disabled={submitting || loadingTypes || !types.length}
                    fullWidth
                >
                    {!types.length ? (
                        <MenuItem value="" disabled>
                            אין סוגי תרגילים זמינים
                        </MenuItem>
                    ) : (
                        types.map((t) => (
                            <MenuItem key={t.exerciseTypeId} value={t.exerciseTypeId}>
                                {t.exerciseTypeName}
                            </MenuItem>
                        ))
                    )}
                </TextField>

                {/* Repetitions */}
                <TextField
                    label="חזרות (repetitions)"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={repetitions}
                    onChange={(e) => setRepetitions(e.target.value)}
                    disabled={submitting}
                    fullWidth
                    placeholder="לדוגמה: 12"
                />

                {/* Sets */}
                <TextField
                    label="סטים (sets)"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    disabled={submitting}
                    fullWidth
                    placeholder="לדוגמה: 3"
                />

                <Button
                    type="submit"
                    disabled={submitting || loadingTypes || !types.length}
                >
                    {submitting ? "שולח…" : "הוסף תרגיל"}
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
