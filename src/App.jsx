import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./views/AuthForm";
import MainPage from "./views/MainPage";
import UserView from "./views/UserView";
import CourseView from "./views/CourseView";
import AdminCourseView from "./views/AdminCourseView";
import ProtectedRoute from "./components/ProtectedRoute";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./services/firebaseService";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

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
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "40px" }}>Chargement en cours...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <AuthForm /> : <Navigate to="/main" />} />

        <Route
          path="/main"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <MainPage user={user} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute user={user} userData={userData} adminOnly>
              <UserView user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute user={user} userData={userData}>
              <CourseView user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute user={user} userData={userData} adminOnly>
              <AdminCourseView />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
