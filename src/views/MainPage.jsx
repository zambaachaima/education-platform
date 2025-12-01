import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PaymentController from "../controllers/PaymentController";
import PurchaseController from "../controllers/PurchaseController";

export default function MainPage() {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();
  const paymentCtrl = new PaymentController();
  const purchaseCtrl = new PurchaseController();

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // Load all courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      const coursesCol = collection(db, "courses");
      const courseSnapshot = await getDocs(coursesCol);

      const courseList = courseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCourses(courseList);
    };

    fetchCourses();
  }, []);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Buy a course
  const handleBuy = async (course) => {
    if (!user) return alert("Veuillez vous connecter pour acheter ce cours.");

    try {
      const payRes = await paymentCtrl.startPayment(course.price, course.id, user.uid);

      if (payRes.status === "success") {
        await purchaseCtrl.addPurchase(user.uid, course.id);

        alert(`🎉 Paiement réussi ! Vous avez accès au cours "${course.title}".`);

        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, owned: true } : c
          )
        );
      } else {
        alert("⚠ Paiement échoué. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du paiement.");
    }
  };

  if (!user || !userData)
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );

  // 🔥 FILTER HERE → Students ONLY see published courses
  const visibleCourses = userData.isAdmin
    ? courses // admin sees everything
    : courses.filter((c) => c.isPublished === true); // students see ONLY published

  return (
    <div className="page-container">
      <div className="admin-lesson-wrapper">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          Bienvenue, {userData.name} 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="course-info"
        >
          Rôle: <span className="font-semibold">
            {userData.isAdmin ? "Administrateur" : "Utilisateur"}
          </span>
        </motion.p>

        {userData.isAdmin && (
          <div className="lesson-controls mb-6 flex-wrap">
            <button className="btn btn-add" onClick={() => navigate("/users")}>
              👥 Gérer les utilisateurs
            </button>

            <button className="btn btn-edit" onClick={() => navigate("/admin/courses")}>
              📚 Gestion des cours
            </button>
          </div>
        )}

        {/* Courses List (filtered for students) */}
        <div className="lessons-grid mb-8">
          {visibleCourses.map((course) => (
            <div key={course.id} className="lesson-card">
              <div>
                <h3 className="lesson-title">{course.title}</h3>
                <p className="lesson-type">{course.description}</p>
                <p className="lesson-status">Prix: {course.price} €</p>
              </div>

              <div className="lesson-actions mt-4 flex flex-col gap-2">

                {userData.isAdmin && (
                  <>
                    <button
                      className="btn btn-edit"
                      onClick={() => navigate(`/admin/lessons/${course.id}`)}
                    >
                      Gestion des leçons
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => navigate(`/admin/quizzes/${course.id}`)}
                    >
                      Gestion des quizzes
                    </button>
                  </>
                )}

                {/* Student actions */}
                {!userData.isAdmin && !course.owned && (
                  <>
                    <button
                      className="btn btn-add"
                      onClick={() => navigate(`/lesson/${course.id}`)}
                    >
                      Voir les leçons
                    </button>

                    <button
                      className="btn btn-submit"
                      onClick={() => navigate(`/quizzes/${course.id}`)}
                    >
                      Voir les quizzes
                    </button>

                    <button
                      className="btn btn-submit"
                      onClick={() => handleBuy(course)}
                    >
                      Acheter
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-delete" onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}
