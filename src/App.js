import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Box } from "@mui/material";

import AppBarNav from "./components/AppBarNav";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ClientPage from "./pages/ClientPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppBarNav />
        <MainContainer>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Client-only */}
            <Route element={<ProtectedRoute role="client" />}>
              <Route path="/me" element={<ClientPage />} />
            </Route>

            {/* Admin-only */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </MainContainer>
      </Router>
    </AuthProvider>
  );
}

function MainContainer({ children }) {
    return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ display: "grid", gap: 2 }}>{children}</Box>
    </Container>
  );
}

function Home() {
  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <h2>ברוכים הבאים ל-TrainMate</h2>
      <p>התחברו כמאמן/אדמין כדי להמשיך.</p>
    </Box>
  );
}
