import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Cpu,
  Brain,
  Sparkles,
} from "lucide-react";
import "./index.css";
import { setAuthUser } from "../../utils/auth";
import { API_CONFIG } from "../../config/api.config";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.detail ?? "Email ou senha inválidos.");
        return;
      }

      const data = await response.json();

      setAuthUser({
        email: data.email,
        name: data.nome,
        role: data.role,
        token: data.access_token,
      });

      if (data.role === "secretaria") {
        navigate("/registration");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Lado esquerdo */}
      <div className="login-image-side">
        <div className="image-overlay" />
        <div className="image-content">
          <div className="brand-badge">
            <span>MediPlataforma</span>
          </div>

          <h1 className="image-title">
            IA que Potencializa <br />
            suas Decisões Clínicas
          </h1>

          <p className="image-description">
            Assistente de IA conversacional para apoio clínico em tempo real.
            Organização inteligente e automatizada de dados médicos para reduzir
            o tempo de análise e aumentar a segurança na tomada de decisão.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <Cpu />
              </div>
              <div className="feature-text">
                <strong>Assistente IA em Tempo Real</strong>
                <span>Suporte clínico instantâneo durante consultas</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Brain />
              </div>
              <div className="feature-text">
                <strong>Organização Automatizada</strong>
                <span>
                  Dados clínicos estruturados por inteligência artificial
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Sparkles />
              </div>
              <div className="feature-text">
                <strong>Análise Inteligente</strong>
                <span>Redução de tempo e mais segurança diagnóstica</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito */}
      <div className="login-form-side">
        <div className="form-wrapper">
          <div className="form-header">
            <div className="mobile-brand">
              <Brain className="mobile-brand-icon" />
              <span>MediPlataforma</span>
            </div>

            <h2 className="form-title">Acessar plataforma</h2>
            <p className="form-subtitle">
              Entre para utilizar o assistente inteligente e otimizar seu
              atendimento clínico.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="input-field">
              <label htmlFor="email" className="input-label">
                E-mail profissional
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="medico@clinicaparceira.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="input-field">
              <div className="password-header">
                <label htmlFor="password" className="input-label">
                  Senha
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Recuperar acesso
                </Link>
              </div>

              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Manter conectado</span>
              </label>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <p style={{ color: "#ef4444", fontSize: "0.875rem", margin: "0" }}>
                {error}
              </p>
            )}

            {/* Botão */}
            <button type="submit" className="login-btn" disabled={loading}>
              <span>{loading ? "Entrando..." : "Entrar"}</span>
              {!loading && <ArrowRight className="btn-icon" />}
            </button>

            {/* Cadastro */}
            <p className="register-text">
              Ainda não utiliza IA no seu consultório?{" "}
              <Link to="/register" className="register-link">
                Ativar acesso agora
              </Link>
            </p>
          </form>

          {/* Selos */}
          <div className="security-badges">
            <div className="security-badge">
              <Brain className="badge-icon" />
              <span>IA em tempo real</span>
            </div>
            <div className="security-badge">
              <Shield className="badge-icon" />
              <span>LGPD</span>
            </div>
            <div className="security-badge">
              <Sparkles className="badge-icon" />
              <span>CFM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;