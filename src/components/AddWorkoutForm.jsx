import { useEffect, useState } from "react";
import { fetchTrainees, fetchExercises, reportExercise } from "../services/api";

export default function AddWorkoutForm({ onCreated, fixedTraineeId }) {
  // Reference data
  const [trainees, setTrainees] = useState([]);
  const [exercises, setExercises] = useState([]);

  // Form fields
  const [traineeId, setTraineeId] = useState(fixedTraineeId || "");
  const [exerciseId, setExerciseId] = useState("");
  const [workoutDate, setWorkoutDate] = useState(""); // datetime-local string: "YYYY-MM-DDTHH:mm"

  // UI state
  const [loading, setLoading] = useState(true);       // loading of dropdown data
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Load dropdown data (trainees/exercises)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setError(null);
        setLoading(true);

        // Load exercises (always)
        const exList = await fetchExercises();

        // Load trainees only if not fixed
        let trList = [];
        if (!fixedTraineeId) {
          trList = await fetchTrainees();
        }

        if (!mounted) return;

        setExercises(exList || []);
        setTrainees(trList || []);

        // Preselect defaults if empty
        if (!fixedTraineeId && trList?.length && !traineeId) {
          setTraineeId(trList[0].traineeId);
        }
        if (exList?.length && !exerciseId) {
          setExerciseId(exList[0].exerciseId);
        }

        // Default workout date: now → "YYYY-MM-DDTHH:mm"
        if (!workoutDate) {
          setWorkoutDate(toDatetimeLocalValue(new Date()));
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load form data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedTraineeId]);

  // If parent changes fixedTraineeId dynamically, sync it to form
  useEffect(() => {
    if (fixedTraineeId) setTraineeId(fixedTraineeId);
  }, [fixedTraineeId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess("");

    // Basic validations
    if (!traineeId) return setError("בחר מתאמן");
    if (!exerciseId) return setError("בחר תרגיל");
    if (!workoutDate) return setError("בחר תאריך ושעה");

    try {
      setSubmitting(true);

      // Convert datetime-local to ISO string (backend model binder parses it)
      const isoDate = new Date(workoutDate).toISOString();

      const created = await reportExercise({
        workoutDate: isoDate,
        traineeId,
        exerciseId,
      });

      setSuccess("האימון נוצר והתרגיל שויך בהצלחה 🎉");

      if (typeof onCreated === "function") onCreated(created);
    } catch (err) {
      setError(err.message || "שגיאה ביצירת האימון");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <h3>דיווח תרגיל (Report Exercise)</h3>
        <p>טוען נתונים…</p>
      </section>
    );
  }

  return (
    <section style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <h3>דיווח תרגיל (Report Exercise)</h3>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {/* Trainee picker (hidden when fixedTraineeId is provided) */}
        {!fixedTraineeId && (
          <LabeledSelect
            label="מתאמן"
            value={traineeId}
            onChange={setTraineeId}
            disabled={submitting || !trainees.length}
            options={trainees.map((t) => ({
              value: t.traineeId,
              label: t.traineeName,
            }))}
            emptyLabel="אין מתאמנים"
          />
        )}

        {/* Exercise picker */}
        <LabeledSelect
          label="תרגיל"
          value={exerciseId}
          onChange={setExerciseId}
          disabled={submitting || !exercises.length}
          options={exercises.map((ex) => ({
            value: ex.exerciseId,
            // Prefer exercise type name if available
            label: ex.exerciseType?.exerciseTypeName ?? ex.exerciseId,
          }))}
          emptyLabel="אין תרגילים"
        />

        {/* Workout date/time */}
        <LabeledInput
          label="תאריך ושעה"
          type="datetime-local"
          value={workoutDate}
          onChange={setWorkoutDate}
          disabled={submitting}
        />

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
        {success && <p style={{ color: "green", margin: 0 }}>{success}</p>}

        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "שולח…" : "צור אימון ושייך תרגיל"}
        </button>
      </form>
    </section>
  );
}

function LabeledSelect({ label, value, onChange, disabled, options, emptyLabel }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ padding: 8 }}
      >
        {!options?.length ? (
          <option value="">{emptyLabel || "No options"}</option>
        ) : (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        )}
      </select>
    </label>
  );
}

/** LabeledInput: generic input with a label */
function LabeledInput({ label, type = "text", value, onChange, disabled, placeholder }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{ padding: 8 }}
      />
    </label>
  );
}

function toDatetimeLocalValue(date) {
  const d = new Date(date.getTime()); // clone to avoid mutation
  const pad = (n) => String(n).padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
}
