import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseService";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      {userData && (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Bienvenue, {userData.name} !
          </h1>
          <p className="mb-4">
            Vous êtes connecté en tant que {userData.isAdmin ? "administrateur" : "utilisateur"}.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => navigate("/courses")}
            >
              Voir les cours
            </button>

            {userData.isAdmin && (
              <>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => navigate("/users")}
                >
                  👥 Gestion des utilisateurs
                </button>

                <button
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                  onClick={() => navigate("/admin/courses")}
                >
                  📚 Gérer les cours
                </button>
              </>
            )}
          </div>
        </>
      )}

      {user && (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      )}
    </div>
  );
}
