import { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle, User, Mail, Phone, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { programs } from "../data/programs";
import { submitContactForm } from "../services/api";

interface LeadFormProps {
  variant?: "light" | "dark";
  preselectedProgram?: string;
}

export default function LeadForm({ variant = "light", preselectedProgram }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: preselectedProgram || "",
  });

  const isDark = variant === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.detail || "Error al enviar. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-[#2FAC66]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-[#2FAC66]" />
        </div>
        <h3
          className={`text-[22px] mb-3 ${isDark ? "text-white" : "text-[#29235C]"}`}
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
        >
          ¡Gracias por tu interés!
        </h3>
        <p className={`text-[15px] ${isDark ? "text-white/60" : "text-[#29235C]/60"}`} style={{ fontFamily: "Montserrat, sans-serif" }}>
          Nuestro equipo te contactará en las próximas 24 horas. Bienvenido a tu nuevo camino.
        </p>
      </motion.div>
    );
  }

  const inputClasses = isDark
    ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-[#F9B233] focus:ring-1 focus:ring-[#F9B233]/30"
    : "bg-[#f4f4f8] border border-[#29235C]/10 text-[#29235C] placeholder:text-[#29235C]/40 focus:border-[#29235C] focus:ring-1 focus:ring-[#29235C]/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="relative">
        <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40" : "text-[#29235C]/40"}`} />
        <input
          type="text"
          placeholder="Nombre Completo"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] outline-none transition-all ${inputClasses}`}
        />
      </div>
      <div className="relative">
        <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40" : "text-[#29235C]/40"}`} />
        <input
          type="email"
          placeholder="Correo Electrónico"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] outline-none transition-all ${inputClasses}`}
        />
      </div>
      <div className="relative">
        <Phone size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40" : "text-[#29235C]/40"}`} />
        <input
          type="tel"
          placeholder="Número de Celular"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] outline-none transition-all ${inputClasses}`}
        />
      </div>
      <div className="relative">
        <BookOpen size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40" : "text-[#29235C]/40"}`} />
        <select
          required
          value={formData.program}
          onChange={(e) => setFormData({ ...formData, program: e.target.value })}
          className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] outline-none transition-all appearance-none ${inputClasses}`}
        >
          <option value="">Selecciona un Programa</option>
          {programs.map((p) => (
            <option key={p.slug} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>
      {error && (
        <div className={`flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg ${isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600"}`}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.02 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        className="w-full bg-[#F9B233] text-[#29235C] py-4 rounded-xl text-[14px] tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#e9a020] transition-colors shadow-lg shadow-[#F9B233]/20 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontWeight: 700 }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? "Enviando..." : "Solicitar Información"}
      </motion.button>
      <p className={`text-center text-[11px] ${isDark ? "text-white/30" : "text-[#29235C]/30"}`}>
        Al enviar, aceptas nuestra política de privacidad. Nunca compartiremos tus datos.
      </p>
    </form>
  );
}
