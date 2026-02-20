import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import apiClient from "../../api/apiClient";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Function to mask email
  const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart[0]}****@${domain}`;
    }
    const visiblePart = localPart.substring(0, 3);
    return `${visiblePart}****@${domain}`;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await apiClient.post("/api/user/forgot-password", null, {
      params: { email },
    });

    setEmailSent(true);
    toast.success("Reset link sent successfully");

  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    setEmailSent(false);
    setEmail("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {!emailSent ? (
          <form onSubmit={handleSubmit}>
            <h2>Forgot Password</h2>
            <p className="auth-subtitle">
              Enter your registered email to receive a reset link
            </p>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="email-sent-confirmation">
            <h2>Check Your Email</h2>
            <p className="auth-subtitle">
              A password reset link has been sent to:
            </p>
            <p className="masked-email">{maskEmail(email)}</p>
            <p className="auth-subtitle">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <button onClick={handleBack} className="back-button">
              Back to Forgot Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;