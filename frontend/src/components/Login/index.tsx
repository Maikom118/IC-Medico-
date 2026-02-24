import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Mail, Lock, Eye, EyeOff, Stethoscope } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card de login */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white mb-4 shadow-lg shadow-blue-200">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              MediPlataforma
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Faça login para acessar sua conta
            </p>
          </div>

          <form className="space-y-5">
            {/* Campo de email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox lembrar */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Lembrar-me
              </label>
            </div>

            {/* Botão de login */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-200"
            >
              Entrar
            </Button>
          </form>

          {/* Link para cadastro */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Cadastre-se
            </a>
          </p>
        </div>

        {/* Créditos/versão */}
        <p className="text-center text-xs text-gray-400 mt-4">
          © 2026 MediPlataforma. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;