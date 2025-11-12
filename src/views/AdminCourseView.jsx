import { useState, useEffect } from "react";
import CourseController from "../controllers/CourseController";

export default function AdminCourseView() {
  const controller = new CourseController();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    price: "",
    description: "",
    isPublished: false,
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const unsub = controller.listenCourses
      ? controller.listenCourses(setCourses)
      : null;
    return () => unsub && unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await controller.updateCourse(editingCourse, form);
        alert("Cours mis à jour !");
      } else {
        await controller.addCourse(
          form.title,
          parseFloat(form.price),
          form.description,
          form.isPublished
        );
        alert("Cours ajouté !");
      }
      setForm({ id: null, title: "", price: "", description: "", isPublished: false });
      setEditingCourse(null);
      setShowForm(false);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course.id);
    setForm(course);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingCourse(null);
    setForm({ id: null, title: "", price: "", description: "", isPublished: false });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Supprimer ce cours ?")) {
      try {
        await controller.deleteCourse(id);
        alert("Cours supprimé !");
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    }
  };

  // Recherche + tri
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];
    if (typeof fieldA === "string" && typeof fieldB === "string")
      return sortOrder === "asc"
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    if (typeof fieldA === "number" && typeof fieldB === "number")
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    return 0;
  });

  // Stats
  const publishedCount = courses.filter(c => c.isPublished).length;
  const draftCount = courses.length - publishedCount;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Gestion des cours</h1>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
        <div className="p-4 border rounded bg-gray-100 w-1/3">
          <strong className="text-lg">Statistiques :</strong>
          <p>Publié : {publishedCount}</p>
          <p>Brouillon : {draftCount}</p>
        </div>
      </div>

      {/* Actions + recherche + tri */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full md:w-auto"
          onClick={handleAddClick}
        >
          Ajouter un cours
        </button>

        <input
          type="text"
          placeholder="Rechercher..."
          className="border p-2 rounded w-full md:w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="title">Titre</option>
            <option value="price">Prix</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="asc">Ascendant</option>
            <option value="desc">Descendant</option>
          </select>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded bg-gray-50 items-center"
        >
          <input
            name="title"
            placeholder="Titre"
            value={form.title}
            onChange={handleChange}
            className="border p-2 rounded w-full md:w-40"
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Prix"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded w-full md:w-40"
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 rounded w-full md:w-60"
          />
          <label className="flex items-center gap-1">
            Publier :
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
          </label>
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editingCourse ? "Enregistrer" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publié</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCourses.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap">{c.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{c.price} TND</td>
                <td className="px-6 py-4 whitespace-nowrap">{c.isPublished ? "✅" : "❌"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
