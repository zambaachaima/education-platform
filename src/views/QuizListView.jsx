import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizController from "../controllers/QuizController";

const quizCtrl = new QuizController();

export default function QuizListView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    const unsub = quizCtrl.listenQuizzesForCourse(courseId, setQuizzes);
    return () => unsub && unsub();
  }, [courseId]);

  if (!quizzes.length) 
    return <div className="page-container"><p>Aucun quiz disponible pour ce cours.</p></div>;

  return (
    <div className="page-container">
      <div className="admin-lesson-wrapper">
        <h1 className="page-title">Quizzes du cours</h1>
        <p className="course-info">Liste des quizzes disponibles pour ce cours</p>

        <div className="lessons-grid">
          {quizzes.map((q) => (
            <div key={q.id} className="lesson-card flex flex-col justify-between">
              <div>
                <div className="lesson-title">{q.title}</div>
                <div className="lesson-type">{q.description}</div>
                <div className="lesson-status text-sm mt-1">
                  {q.questions?.length || 0} question(s) • Passscore: {q.passScore}% • Max attempts: {q.maxAttempts ?? "∞"}
                </div>
              </div>

              <button
                onClick={() => navigate(`/quiz/${q.id}`)}
                className="btn btn-submit mt-3 self-start"
              >
                Commencer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
