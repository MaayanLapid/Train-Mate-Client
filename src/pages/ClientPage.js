import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AddWorkoutForm from "../components/AddWorkoutForm";
import WorkoutsList from "../components/WorkoutsList";

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function ClientPage() {
  const { auth, logout } = useAuth();
  const traineeId = auth?.traineeId;
  const traineeName = auth?.traineeName || "מתאמן";

  const [range, setRange] = useState(() => getThisMonthRange());
  const [refreshTick, setRefreshTick] = useState(0);

  const reloadKey = useMemo(
    () => `${traineeId}_${range.start}_${range.end}_${refreshTick}`,
    [traineeId, range.start, range.end, refreshTick]
  );

  function handleCreated() {
    setRefreshTick((n) => n + 1);
  }

  return (
    <Container sx={{ mt: 3 }}>
      <Header traineeName={traineeName} onLogout={logout} />

      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="טווח תאריכים"
            subheader={`טווח נוכחי: ${range.start} → ${range.end}`}
          />
          <CardContent>
            <ButtonGroup variant="outlined">
              <Button onClick={() => setRange(getTodayRange())}>היום</Button>
              <Button onClick={() => setRange(getYesterdayRange())}>אתמול</Button>
              <Button onClick={() => setRange(getThisMonthRange())}>החודש</Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="דיווח תרגיל (Report Exercise)" />
          <CardContent>
            <AddWorkoutForm fixedTraineeId={traineeId} onCreated={handleCreated} />
          </CardContent>
        </Card>

        <Divider />

        <Card>
          <CardHeader title="האימונים שלי" />
          <CardContent>
            <WorkoutsList
              key={reloadKey}
              fixedTraineeId={traineeId}
              start={range.start}
              end={range.end}
            />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

function Header({ traineeName, onLogout }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Typography variant="h5" sx={{ flexGrow: 1 }}>
        שלום, {traineeName}
      </Typography>
      <Button onClick={onLogout} color="inherit" variant="outlined">
        התנתקות
      </Button>
    </Box>
  );
}

/** toISODate: Date -> "yyyy-MM-dd" */
function toISODate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

function getTodayRange() {
  const now = new Date();
  const iso = toISODate(now);
  return { start: iso, end: iso };
}

function getYesterdayRange() {
  const now = new Date();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const y = new Date(now.getTime() - DAY_MS);
  const iso = toISODate(y);
  return { start: iso, end: iso };
}

function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}
