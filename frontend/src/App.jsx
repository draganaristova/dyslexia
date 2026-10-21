import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/ProfilePage";
import GameSelection from "./pages/GameSelection";
import WorldPath from "./pages/WorldPath";
import ProtectedRoute from "./components/ProtectedRoute";
import Progress from "./pages/Progress";
import ExercisePage from "./pages/ExercisePage";
import RelaxationPage from "./pages/RelaxationPage";
import LearningPage from "./pages/LearningPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/gameselection" element={<ProtectedRoute><GameSelection /></ProtectedRoute>} />
      <Route path="/world/:worldId" element={<ProtectedRoute><WorldPath /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/world/:worldId/exercise/:gamesId/:gamesType/:pinNumber" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
      <Route path="/relaxation" element={<ProtectedRoute><RelaxationPage /></ProtectedRoute>} />
      <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;