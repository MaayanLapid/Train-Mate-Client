import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppBarNav() {
  const { auth, logout } = useAuth();

  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Container>
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Brand />
          <Box sx={{ flexGrow: 1 }} />

          <Button component={RouterLink} to="/" color="inherit">
            בית
          </Button>

          {!auth && (
            <Button component={RouterLink} to="/login" color="inherit">
              התחברות
            </Button>
          )}

          {auth?.role === "client" && (
            <Button component={RouterLink} to="/me" color="inherit">
              האימונים שלי
            </Button>
          )}

          {auth?.role === "admin" && (
            <Button component={RouterLink} to="/admin" color="inherit">
              אדמין
            </Button>
          )}

          {!!auth && (
            <Button onClick={logout} color="inherit">
              התנתקות
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}



function Brand() {
    return (
    <Typography variant="h6" component={RouterLink} to="/" color="inherit" sx={{ textDecoration: "none" }}>
      TrainMate
    </Typography>
  );
}
