import { useEffect, useMemo, useState } from "react";
import { fetchWorkouts, fetchTrainees } from "../services/api";

export default function WorkoutsList({ fixedTraineeId, start, end }) {
  const [trainees, setTrainees] = useState([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState(fixedTraineeId || "");
  const [workouts, setWorkouts] = useState([]);

  const [loadingTrainees, setLoadingTrainees] = useState(!fixedTraineeId);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [error, setError] = useState(null);

  // Compute effective date range (fallback to ±30 days if not provided)
  const range = useMemo(() => {
    if (start && end) return { start, end };

    // Use getTime() to avoid mutating 'now'
    const toISO = (d) => d.toISOString().slice(0, 10);
    const now = new Date();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const startFallback = new Date(now.getTime() - 30 * DAY_MS);
    const endFallback = new Date(now.getTime() + 30 * DAY_MS);
    return { start: toISO(startFallback), end: toISO(endFallback) };
  }, [start, end]);

  // Load trainees ONLY if there is no fixed trainee
  useEffect(() => {
    if (fixedTraineeId) {
      // If a fixed trainee is provided, set it and skip loading trainees
      setSelectedTraineeId(fixedTraineeId);
      setLoadingTrainees(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setError(null);
        setLoadingTrainees(true);
        const list = await fetchTrainees();
        if (!mounted) return;

        setTrainees(list || []);
        // Auto-select first trainee if available
        if (list?.length) setSelectedTraineeId(list[0].traineeId);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load trainees");
      } finally {
        if (!mounted) return;
        setLoadingTrainees(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fixedTraineeId]);

  // Load workouts whenever selected trainee or range changes
  useEffect(() => {
    if (!selectedTraineeId) return;

    let mounted = true;
    (async () => {
      try {
        setError(null);
        setLoadingWorkouts(true);

        // Fetch workouts by trainee in the computed/received range
        const list = await fetchWorkouts({
          traineeId: selectedTraineeId,
          start: range.start,
          end: range.end,
        });

        if (!mounted) return;
        setWorkouts(list || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load workouts");
        setWorkouts([]);
      } finally {
        if (!mounted) return;
        setLoadingWorkouts(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedTraineeId, range.start, range.end]);

  if (loadingWorkouts) return <p>טוען אימונים…</p>;
  if (error) return <p>שגיאה: {error}</p>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ textAlign: "center" }}>אימונים</h2>

      {/* Render trainee picker ONLY if not fixed */}
      {!fixedTraineeId && (
        <TraineePicker
          trainees={trainees}
          loading={loadingTrainees}
          value={selectedTraineeId}
          onChange={setSelectedTraineeId}
        />
      )}

      {workouts.length === 0 ? (
        <p>אין אימונים להצגה.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {workouts.map((w) => (
            <li key={w.workoutId}>
              <WorkoutCard workout={w} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TraineePicker({ trainees, loading, value, onChange }) {
  return (
    <div style={{ display: "grid", gap: 6, maxWidth: 420 }}>
      <label>
        בחר מתאמן
        {loading ? (
          <div>טוען מתאמנים…</div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            {!trainees.length && <option value="">אין מתאמנים</option>}
            {trainees.map((t) => (
              <option key={t.traineeId} value={t.traineeId}>
                {t.traineeName}
              </option>
            ))}
          </select>
        )}
      </label>
    </div>
  );
}


function WorkoutCard({ workout }) {
  // Safely access fields that may be null
  const dateLabel = formatDate(workout.workoutDate ?? workout.date);
  const traineeName = workout.trainee?.traineeName ?? "—";
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];

  return (
    <article
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        display: "grid",
        gap: 8,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <strong>Workout: {workout.workoutId}</strong>
        <span>תאריך: {dateLabel}</span>
      </header>

      <div style={{ opacity: 0.8 }}>
        {/* Show trainee name if API returns it; otherwise show the ID */}
        מתאמן: {traineeName}{" "}
        <span style={{ fontSize: 12, opacity: 0.7 }}>({workout.traineeId})</span>
      </div>

      <div>
        <strong>תרגילים:</strong> {exercises.length}
      </div>

      {!!exercises.length && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 6,
          }}
        >
          {exercises.map((ex) => (
            <li
              key={ex.exerciseId}
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 8,
              }}
            >
              {/* Exercise row */}
              <div>
                <strong>
                  {ex.exerciseType?.exerciseTypeName ?? ex.exerciseTypeId ?? "Exercise"}
                </strong>
              </div>
              <div style={{ opacity: 0.85 }}>
                סטים: {ex.sets ?? "—"}, חזרות: {ex.repetitions ?? "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function formatDate(isoOrNull) {
  if (!isoOrNull) return "—";
  const d = new Date(isoOrNull);
  if (isNaN(d)) return isoOrNull; // fallback to raw string if invalid
  return d.toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
