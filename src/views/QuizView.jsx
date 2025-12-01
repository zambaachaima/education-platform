import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuizController from "../controllers/QuizController";
import QuizAttemptController from "../controllers/QuizAttemptController";
import { getAuth } from "firebase/auth";

const quizCtrl = new QuizController();
const attemptCtrl = new QuizAttemptController();

export default function QuizView() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attemptsCount, setAttemptsCount] = useState(0);

  const showCorrection = location.state?.showCorrection || false;

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      const q = await quizCtrl.getQuizById(quizId);
      setQuiz(q);
      const initial = {};
      (q?.questions || []).forEach((qq) => {
        initial[qq.id] = null;
      });
      setAnswers(initial);
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    const fetchAttempts = async () => {
      const user = auth.currentUser;
      if (!user || !quiz) return;

      const attempts = await attemptCtrl.fetchAttemptsForQuizByUser(quiz.id, user.uid);
      setAttemptsCount(attempts.length);

      if (attempts.length >= (quiz.maxAttempts || Infinity) || showCorrection) {
        if (attempts.length > 0) {
          const lastAttempt = attempts[0];
          setResult({
            score: lastAttempt.score,
            passed: lastAttempt.passed,
            correctCount: lastAttempt.answers.filter((a, idx) => a.selectedIndex === quiz.questions[idx].correctAnswerIndex).length,
            total: quiz.questions.length,
            perQuestion: quiz.questions.map((q) => {
              const ans = lastAttempt.answers.find(a => a.questionId === q.id);
              return {
                questionId: q.id,
                selectedIndex: ans?.selectedIndex ?? null,
                correct: ans?.selectedIndex === q.correctAnswerIndex,
                correctAnswerIndex: q.correctAnswerIndex,
                explanation: q.explanation || "",
              };
            })
          });
        } else {
          setResult(null);
        }
      }
    };
    fetchAttempts();
  }, [auth, quiz, showCorrection]);

  if (!quiz) return <div className="page-container"><p>Chargement du quiz...</p></div>;

  const remainingAttempts = quiz.maxAttempts
    ? Math.max(quiz.maxAttempts - attemptsCount, 0)
    : Infinity;

  const handleSelect = (questionId, index) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const evaluate = (quizDoc, answersMap) => {
    const questions = quizDoc.questions || [];
    let correct = 0;
    const perQuestion = questions.map((q) => {
      const selected = answersMap[q.id];
      const isCorrect = typeof selected === "number" && selected === q.correctAnswerIndex;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        selectedIndex: selected,
        correct: isCorrect,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation || "",
      };
    });
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= (quizDoc.passScore || 70);
    return { score, passed, correctCount: correct, total: questions.length, perQuestion };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) return setError("Tu dois être connecté pour passer le quiz.");

    try {
      setLoading(true);
      const attempts = await attemptCtrl.fetchAttemptsForQuizByUser(quiz.id, user.uid);
      if (quiz.maxAttempts && attempts.length >= quiz.maxAttempts) {
        setError(`Nombre maximal de tentatives atteint (${quiz.maxAttempts}).`);
        setLoading(false);
        return;
      }

      const res = evaluate(quiz, answers);
      await attemptCtrl.addAttempt({
        quizId: quiz.id,
        userId: user.uid,
        answers: Object.keys(answers).map((qid) => ({ questionId: qid, selectedIndex: answers[qid] })),
        score: res.score,
        passed: res.passed,
      });

      setAttemptsCount((prev) => prev + 1);
      setResult(res);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="admin-lesson-wrapper">
        <h1 className="page-title">{quiz.title}</h1>
        <p className="course-info">{quiz.description}</p>
        <p className="text-gray-700 mb-4">
          Tentatives : {attemptsCount} / {quiz.maxAttempts || "∞"}{" "}
          {remainingAttempts !== Infinity && `(restantes : ${remainingAttempts})`}
        </p>

        {result || remainingAttempts === 0 || showCorrection ? (
          <div className="quiz-card">
            <h2 className="text-xl font-semibold mb-2">Correction</h2>
            <p>Score : <strong>{result?.score ?? 0}%</strong> ({result?.correctCount ?? 0}/{result?.total ?? 0})</p>
            <p>{result?.passed ? <span className="text-green-600">Réussi ✅</span> : <span className="text-red-600">Échoué ❌</span>}</p>

            <div className="mt-4">
              {result?.perQuestion.map((pq, i) => {
                const q = quiz.questions.find((x) => x.id === pq.questionId);
                return (
                  <div key={pq.questionId} className="p-3 border rounded mb-2 bg-gray-50">
                    <div className="font-medium">{i + 1}. {q.text}</div>
                    <div className="mt-1">
                      {q.choices.map((c, ci) => (
                        <div key={ci} className={`pl-3 ${ci === q.correctAnswerIndex ? "font-semibold text-green-700" : ""}`}>
                          {ci === pq.selectedIndex ? "→ " : ""}{c}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <div className="text-gray-600 mt-1">Explication : {q.explanation}</div>}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => navigate("/quiz-history")} className="btn btn-cancel">Historique</button>
              <button onClick={() => navigate("/main")} className="btn btn-submit">Retour</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="quiz-card">
                <div className="font-medium mb-2">{idx + 1}. {q.text}</div>
                <div className="flex flex-col gap-2">
                  {q.choices.map((c, ci) => (
                    <label key={ci} className="flex items-center gap-2">
                      <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === ci} onChange={() => handleSelect(q.id, ci)} />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn btn-submit">Passer le quiz</button>
              <button type="button" onClick={() => navigate("/quiz-history")} className="btn btn-cancel">Historique</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
