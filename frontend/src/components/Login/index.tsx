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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    let adminTest = {
      admin: "admin@email.com",
      password: "12345"
    }

    console.log("Login funcionando...");

    if (email === adminTest.admin && password === adminTest.password) {
      navigate("/dashboard");
      console.log({
        email,
        password,
        rememberMe,
      });
    } else {
      alert("Credenciais inválidas");
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

            {/* Botão */}
            <button type="submit" className="login-btn">
              <span>Entrar</span>
              <ArrowRight className="btn-icon" />
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