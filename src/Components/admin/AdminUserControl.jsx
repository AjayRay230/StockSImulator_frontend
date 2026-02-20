import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";
import apiClient from "../../api/apiClient";
function AdminUserControl() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const countRes = await apiClient.get("/api/admin/users/count");
      setTotalUsers(countRes.data);

      const usersRes = await apiClient.get("/api/admin/users");
      setUsers(
        usersRes.data.map((u) => ({
          ...u,
          portfolioValue: null,
        }))
      );

    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  // Delete user
  
const deleteUser = async (userId) => {
  if (!window.confirm("Are you sure?")) return;

  try {
    await apiClient.delete(`/api/admin/users/${userId}`);

    setUsers((prev) =>
      prev.filter((u) => u.userId !== userId)
    );

    setTotalUsers((prev) => prev - 1);

  } catch (err) {
    console.error("Error deleting user:", err);
  }
};

const updateRole = async (userId, newRole) => {
  try {
    await apiClient.put(
      `/api/admin/users/${userId}/role`,
      {},
      {
        params: { role: newRole },
      }
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId ? { ...u, role: newRole } : u
      )
    );

  } catch (err) {
    console.error("Error updating role:", err);
  }
};



  // Get portfolio value
const getPortfolioValue = async (userId) => {
  try {
    const res = await apiClient.get(
      `/api/admin/users/${userId}/portfolio-value`
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? { ...u, portfolioValue: res.data }
          : u
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
