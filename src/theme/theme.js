
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "light",
    primary: { main: "#1976d2" }, 
    secondary: { main: "#9c27b0" },
    success: { main: "#2e7d32" },
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
    info: { main: "#0288d1" },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '"Heebo"',
      '"Rubik"',
      '"Assistant"',
      '"Segoe UI"',
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained" },
    },
    MuiTextField: {
      defaultProps: { size: "medium" },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
    },
  },
});

export default theme;
