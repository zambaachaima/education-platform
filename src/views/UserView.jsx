import { useState, useEffect } from "react";
import UserController from "../controllers/UserController";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function UserView() {
  const controller = new UserController();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", isAdmin: false });
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const unsubscribe = controller.listenUsers(setUsers);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Remplis tous les champs !");
    try {
      if (editingUser) {
        await controller.updateUser(editingUser, { ...form });
        alert("Utilisateur mis à jour !");
        setEditingUser(null);
      } else {
        await controller.addUser(form.name, form.email, form.isAdmin);
        alert("Utilisateur ajouté !");
      }
      setForm({ name: "", email: "", isAdmin: false });
      setShowForm(false);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setForm({ name: user.name, email: user.email, isAdmin: user.isAdmin });
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", isAdmin: false });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      try {
        await controller.deleteUser(id);
        alert("Utilisateur supprimé !");
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    return new Date(timestamp).toLocaleString();
  };

  // Recherche et tri
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];
    if (fieldA instanceof Date && fieldB instanceof Date)
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    if (typeof fieldA === "string" && typeof fieldB === "string")
      return sortOrder === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    return 0;
  });

  // Stats
  const adminCount = users.filter(u => u.isAdmin).length;
  const normalCount = users.filter(u => !u.isAdmin).length;
  const chartData = [
    { name: "Admin", value: adminCount },
    { name: "Normal", value: normalCount }
  ];
  const COLORS = ["#0088FE", "#00C49F"];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Gestion des utilisateurs</h1>

      {/* Stats + Pie chart */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="p-4 border rounded bg-gray-100 w-full md:w-1/3">
          <strong className="text-lg">Statistiques :</strong>
          <p>Administrateurs : {adminCount}</p>
          <p>Utilisateurs normaux : {normalCount}</p>
        </div>
        <PieChart width={200} height={200}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full md:w-auto"
          onClick={handleAddClick}
        >
          Ajouter un utilisateur
        </button>

        <input
          type="text"
          placeholder="Rechercher..."
          className="border p-2 rounded w-full md:w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <select value={sortField} onChange={e => setSortField(e.target.value)} className="border p-2 rounded">
            <option value="name">Nom</option>
            <option value="createdAt">Créé</option>
            <option value="updatedAt">Mis à jour</option>
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border p-2 rounded">
            <option value="asc">Ascendant</option>
            <option value="desc">Descendant</option>
          </select>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded bg-gray-50 items-center">
          <input
            type="text"
            placeholder="Nom"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full md:w-40"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded w-full md:w-60"
          />
          <label className="flex items-center gap-1">
            Admin:
            <input
              type="checkbox"
              checked={form.isAdmin}
              onChange={e => setForm({ ...form, isAdmin: e.target.checked })}
            />
          </label>
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editingUser ? "Enregistrer" : "Ajouter"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mis à jour</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.isAdmin ? "✅" : "❌"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(u.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                  <button onClick={() => handleEdit(u)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">✏️</button>
                  <button onClick={() => handleDelete(u.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
