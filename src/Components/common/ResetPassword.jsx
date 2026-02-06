import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing token");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "https://stocksimulator-backend.onrender.com/api/user/reset-password",
        null,
        {
          params: { token, newPassword: password }
        }
      );
      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error("Reset link expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form onSubmit={handleSubmit} className="reset-form">
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
