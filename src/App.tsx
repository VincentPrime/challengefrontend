import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "@/auth/login/login";
import Home from "./home/home";
import { Signup } from "./auth/signup/signup";
import { ProtectedRoute } from "@/components/protectedRoutes/protectedRoutes"

export default function App() {
  return (
    <>
        <Routes>
          <Route path="/auth/login" element={<LoginForm />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
    </>
  );
}
