import { useState } from "react";
import AuthPage from "./components/AuthPage";
import MovAIApp from "./components/MovAIApp";

export default function App() {
  // null = no autenticado | objeto = usuario logueado
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);
  const handleUpdateUser = (updated) => setUser(updated);

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <MovAIApp
      user={user}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    />
  );
}