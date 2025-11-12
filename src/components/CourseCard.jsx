export default function CourseCard({ course }) {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition w-full md:w-80">
      <h3 className="text-lg font-bold mb-2">{course.title}</h3>
      <p className="text-gray-700 mb-2">{course.description}</p>
      <p className="font-semibold mb-2">
        Prix : {course.price > 0 ? `${course.price} TND` : "Gratuit"}
      </p>
      <p className={course.isPublished ? "text-green-600" : "text-red-600"}>
        {course.isPublished ? "Publié" : "Non publié"}
      </p>
    </div>
  );
}
