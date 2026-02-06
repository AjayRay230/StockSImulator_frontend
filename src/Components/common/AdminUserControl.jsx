import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";

function AdminUserControl() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch users + count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // stored after login
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const countRes = await axios.get("https://stocksimulator-backend.onrender.com/api/user/count", config);
        setTotalUsers(countRes.data);

        const usersRes = await axios.get("https://stocksimulator-backend.onrender.com/api/user/all", config);
        setUsers(usersRes.data.map(u=>({...u,portfolioValue:null})));
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete user
  
const deleteUser = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  try {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`https://stocksimulator-backend.onrender.com/api/user/id/${id}`, config);

    // FIX: use userId instead of id
    setUsers(users.filter((u) => u.userId !== id));
    setTotalUsers((prev) => prev - 1);
  } catch (err) {
    console.error("Error deleting user:", err);
  }
};

const updateRole = async (id, newRole) => {
  try {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.put(
      `https://stocksimulator-backend.onrender.com/api/user/id/${id}/role?role=${newRole}`,{},
      config
    );

    // FIX: use userId instead of id
    setUsers(
      users.map((u) =>
        u.userId === id ? { ...u, role: newRole } : u
      )
    );
  } catch (err) {
    console.error("Error updating role:", err);
  }
};


  // Get portfolio value
  const getPortfolioValue = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`https://stocksimulator-backend.onrender.com/api/user/id/${id}/portfolio-value`, config);

      setUsers(
        users.map((u) =>
          u.userId === id ? { ...u, portfolioValue: res.data } : u
        )
      );
    } catch (err) {
      console.error("Error fetching portfolio value:", err);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="summary">Total Users: {totalUsers}</p>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>UserName</th>
            <th>Email</th>
            <th>Role</th>
            <th>Portfolio Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.userId, e.target.value)}
                  className="role-select"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td>
                {u.portfolioValue !== null ? (
                  `$${u.portfolioValue}`
                ) : (
                  <button
                    className="portfolio-btn"
                    onClick={() => getPortfolioValue(u.userId)}
                  >
                    <FaEye /> View
                  </button>
                )}
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => deleteUser(u.userId)}
                >
                <FaTrash/>  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserControl;
