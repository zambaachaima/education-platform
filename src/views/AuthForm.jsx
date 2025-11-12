import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signUp, login, logout, resetPassword } from "../services/firebaseAuthService";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", name: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  // 🔁 Vérifie si un utilisateur est connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(form.email, form.password);
        // 👇 pas de alert ici
      } else {
        if (form.password !== form.confirmPassword)
          return alert("Les mots de passe ne correspondent pas !");
        await signUp(form.email, form.password, form.name);
        alert("Compte créé ! Vérifie ton email.");
      }
      setForm({ email: "", password: "", confirmPassword: "", name: "" });
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    alert("Déconnecté !");
  };

  const handleForgotPassword = async () => {
    if (!form.email) return alert("Merci de saisir votre email !");
    await resetPassword(form.email);
  };

  return (
    <div className="p-6 border rounded w-80 mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "Connexion" : "Inscription"}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {!isLogin && (
          <input
            type="text"
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded"
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirmer mot de passe"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="border p-2 rounded"
          />
        )}
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {isLogin ? "Se connecter" : "S’inscrire"}
        </button>
      </form>

      <div className="mt-2 text-sm flex flex-col gap-1">
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>

        {isLogin && (
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={handleForgotPassword}
          >
            Mot de passe oublié ?
          </button>
        )}

        {/* 🔒 Bouton Déconnexion visible seulement si connecté */}
        {currentUser && (
          <button
            type="button"
            className="text-red-600 hover:underline"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        )}
      </div>
    </div>
  );
}
