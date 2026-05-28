import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signIn } from "../../lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-title">{t("auth.title")}</div>
          <div className="login-sub">{t("auth.subtitle")}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">{t("auth.emailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="field">
            <label className="field-label">{t("auth.passwordLabel")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-full btn-full--teal"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t("auth.loading") : t("auth.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
