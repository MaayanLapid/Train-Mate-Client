
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container, Box } from "@mui/material";
import AppBarNav from "./components/AppBarNav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ClientPage from "./pages/ClientPage.jsx";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppBarNav />

        <MainContainer>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Client-only */}
            <Route element={<ProtectedRoute role="client" />}>
              <Route path="/me" element={<ClientPage />} />
            </Route>

            {/* Admin-only */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
      <h2>ברוכים הבאים ל־TrainMate</h2>
      <p>התחבר/י או הירשם/י כדי להמשיך.</p>
    </Box>
  );
}
