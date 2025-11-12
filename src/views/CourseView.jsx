import { useEffect, useState } from "react";
import CourseController from "../controllers/CourseController";
import CourseCard from "../components/CourseCard";

export default function CourseView() {
  const controller = new CourseController();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Écoute temps réel
    const unsubscribe = controller.listenCourses(setCourses);
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Catalogue des cours</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
