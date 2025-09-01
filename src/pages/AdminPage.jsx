import { useAuth } from "../context/AuthContext";
import AddTraineeForm from "../components/AddTraineeForm";
import TraineeList from "../components/TraineeList";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function AdminPage() {
  const { logout } = useAuth();

  return (
    <Container sx={{ mt: 3 }}>
      <Header onLogout={logout} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <SectionCard title="הוספת מתאמן">
            <AddTraineeForm onCreated={() => {}} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <SectionCard title="מתאמנים">
            <TraineeList />
          </SectionCard>
        </Grid>
      </Grid>
    </Container>
  );
}

function Header({ onLogout }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Typography variant="h5" sx={{ flexGrow: 1 }}>
        ניהול מתאמנים (Admin)
      </Typography>
      <Button onClick={onLogout} color="inherit" variant="outlined">
        התנתקות
      </Button>
    </Box>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
