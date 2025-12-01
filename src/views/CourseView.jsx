import { useEffect, useState } from "react";
import CourseController from "../controllers/CourseController";
import CourseCard from "../components/CourseCard";

export default function CourseView() {
  const controller = new CourseController();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const unsubscribe = controller.listenCourses(setCourses);
    return () => unsubscribe();
  }, []);

  // 👇 ONLY show published courses
  const visibleCourses = courses.filter(c => c.isPublished === true);

  return (
    <div className="page-container">
      <div className="admin-lesson-wrapper">
        <h1 className="page-title">Catalogue des cours</h1>
        <p className="course-info">
          {visibleCourses.length} cours disponibles
        </p>

        <div className="lessons-grid">
          {visibleCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
