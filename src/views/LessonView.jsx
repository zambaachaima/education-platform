import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LessonController from "../controllers/LessonController";

export default function LessonView() {
  const { courseId } = useParams();
  const controller = new LessonController(courseId);

  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = controller.listenLessons((allLessons) => {
      // Only published lessons
      const publishedLessons = allLessons.filter((l) => l.preview);
      setLessons(publishedLessons);
    });
    return () => unsubscribe();
  }, [courseId]);

  const filteredLessons = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="admin-lesson-wrapper">
        <h1 className="page-title">Leçons du cours</h1>
        <p className="course-info">
          Ce cours contient {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
        </p>

        <input
          type="text"
          placeholder="Rechercher une leçon..."
          className="input-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredLessons.length === 0 ? (
          <p className="text-gray-600 mt-4">Aucune leçon disponible pour ce cours.</p>
        ) : (
          <div className="lessons-grid mt-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="lesson-card">
                <h3 className="lesson-title">{lesson.title}</h3>
                <p className="lesson-type">Type : {lesson.type}</p>
                <div className="lesson-file">
                  {lesson.fileUrl ? (
                    lesson.type === "video" ? (
                      <video src={lesson.fileUrl} controls className="video-preview" />
                    ) : (
                      <a href={lesson.fileUrl} target="_blank" rel="noreferrer" className="file-link">
                        {lesson.fileName}
                      </a>
                    )
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
