import { createContext, useContext } from "react";
import Swal from "sweetalert2";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const showAlert = (message, type = "info") => {
    const icons = {
      success: "success",
      error: "error",
      warning: "warning",
      info: "info",
    };

    Swal.fire({
      title:
        type === "success"
          ? "Success!"
          : type === "error"
          ? "Error!"
          : type === "warning"
          ? "Warning!"
          : "Info",
      text: message,
      icon: icons[type],
      confirmButtonColor: "#2563eb", // Tailwind blue-600
      background: "#f8fafc", // Tailwind slate-50
      color: "#0f172a", // Tailwind slate-900
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

// custom hook for easy access
export function useAlert() {
  return useContext(AlertContext);
}
