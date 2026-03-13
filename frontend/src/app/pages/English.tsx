import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  Globe,
  Award,
  Clock,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  MessageSquare,
  Headphones,
  PenTool,
  Eye,
  CheckCircle,
  ChevronDown,
  Zap,
  GraduationCap,
  Calendar,
  Shield,
  Briefcase,
  Building2,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import LeadForm from "../components/LeadForm";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const levels = [
  {
    code: "A1",
    name: "Principiante",
    color: "#2FAC66",
    desc: "Preséntate, haz preguntas básicas y comprende frases simples de la vida cotidiana.",
    skills: ["Saludos básicos", "Información personal", "Preguntas simples"],
  },
  {
    code: "A2",
    name: "Elemental",
    color: "#2FAC66",
    desc: "Comunícate en tareas rutinarias, describe tu entorno y maneja situaciones cotidianas.",
    skills: ["Rutinas diarias", "Compras y viajes", "Experiencias pasadas"],
  },
  {
    code: "B1",
    name: "Intermedio",
    color: "#F9B233",
    desc: "Maneja situaciones de viaje, describe experiencias, expresa opiniones y planes con confianza.",
    skills: ["Situaciones de viaje", "Expresar opiniones", "Planes futuros"],
  },
  {
    code: "B2",
    name: "Intermedio Alto",
    color: "#F9B233",
    desc: "Interactúa con fluidez con hablantes nativos y produce textos claros sobre temas diversos.",
    skills: ["Conversación fluida", "Temas técnicos", "Escritura detallada"],
  },
  {
    code: "C1",
    name: "Avanzado",
    color: "#A8151C",
    desc: "Exprésate de forma fluida y espontánea para fines sociales, académicos y profesionales.",
    skills: ["Escritura académica", "Inglés profesional", "Argumentos complejos"],
  },
  {
    code: "C2",
    name: "Maestría",
    color: "#A8151C",
    desc: "Comprende prácticamente todo y exprésate con precisión y matices a nivel nativo.",
    skills: ["Fluidez nativa", "Textos especializados", "Cualquier debate"],
  },
];

const skills = [
  { icon: MessageSquare, name: "Speaking", desc: "Desarrolla confianza en la comunicación verbal con ejercicios interactivos" },
  { icon: Headphones, name: "Listening", desc: "Entrena tu oído con audio real de hablantes nativos" },
  { icon: Eye, name: "Reading", desc: "Construye comprensión con textos diversos en distintos niveles" },
  { icon: PenTool, name: "Writing", desc: "Domina la expresión escrita desde correos hasta ensayos académicos" },
];

const faqs = [
  {
    q: "¿Quién puede inscribirse en el programa de inglés?",
    a: "Cualquier persona desde los 6 años en adelante. No se requiere conocimiento previo. Si tienes experiencia previa, puedes tomar nuestro examen de clasificación gratuito para iniciar en el nivel adecuado.",
  },
  {
    q: "¿Cómo es el examen de clasificación?",
    a: "El examen diagnóstico evalúa todas las habilidades comunicativas (habla, escucha, gramática, comprensión y escritura) mediante pruebas escritas y orales. Es gratuito y nos ayuda a ubicarte en el nivel óptimo.",
  },
  {
    q: "¿Qué opciones de horario hay disponibles?",
    a: "Ofrecemos cursos regulares (4 horas por semana) e intensivos (8-10 horas por semana). Las clases se organizan por horario, intereses y grupos de edad para adaptarse a tu estilo de vida.",
  },
  {
    q: "¿Recibo certificación oficial?",
    a: "Sí. Puedes obtener certificación al finalizar cada ciclo del MCER (A1, A2, B1, B2, C1, C2). Los estudiantes que demuestren suficiencia en el examen de clasificación pueden ir directamente al examen de certificación.",
  },
  {
    q: "¿Qué es el marco MCER?",
    a: "El Marco Común Europeo de Referencia para las Lenguas (MCER) es el estándar internacional para medir la competencia lingüística. Nuestro programa sigue este marco desde A1 (Principiante) hasta C2 (Maestría).",
  },
  {
    q: "¿Pueden las empresas inscribir a sus empleados?",
    a: "Por supuesto. Ofrecemos programas de capacitación corporativa (B2B) adaptados a las necesidades de tu organización, con horarios flexibles y tarifas grupales.",
  },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#29235C]/10 rounded-xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#f8f8fc] transition-colors"
      >
        <span className="text-[#29235C] text-[15px] pr-4" style={{ fontWeight: 600 }}>{q}</span>
        <ChevronDown size={18} className={`text-[#29235C]/40 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-[#29235C]/60 text-[14px] leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

export default function English() {
  return (
    <div className="overflow-hidden" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-[#29235C] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#29235C] via-[#1e1a4a] to-[#151238]" />
          <div className="absolute top-0 right-0 w-[55%] h-full opacity-25">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1764726354539-96228698dc45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMG1lZXRpbmclMjBpbnRlcm5hdGlvbmFsfGVufDF8fHx8MTc3MzQyMTM1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Reunión profesional internacional"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#29235C] via-[#29235C]/90 to-transparent" />
          <motion.div
            className="absolute -bottom-32 right-20 w-[400px] h-[400px] rounded-full border border-[#F9B233]/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8"
            >
              <Globe size={14} className="text-[#F9B233]" />
              <span className="text-white/70 text-[12px] tracking-wider uppercase" style={{ fontWeight: 500 }}>
                Certificación MCER &middot; A1 a C2
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-white text-[clamp(2.5rem,5vw,3.8rem)] leading-[1.1] mb-6"
              style={{ fontWeight: 800 }}
            >
              Domina el Inglés.
              <br />
              <span className="text-[#F9B233]">Abre las Puertas al Mundo.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/60 text-[17px] leading-relaxed mb-10 max-w-lg"
            >
              De principiante a maestría. Nuestro programa alineado al MCER desarrolla las cuatro habilidades comunicativas con horarios flexibles y certificación oficial en cada nivel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20ingl%C3%A9s"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#F9B233] text-[#29235C] px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-[#e9a020] transition-all duration-300 hover:shadow-xl hover:shadow-[#F9B233]/20 group"
                style={{ fontWeight: 700 }}
              >
                Inscríbete Ahora
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#niveles"
                className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-white/10 transition-all duration-300"
                style={{ fontWeight: 600 }}
              >
                Ver Niveles
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { icon: Clock, label: "4-10 hrs/semana" },
                { icon: Award, label: "Certificación MCER" },
                { icon: Users, label: "Grupos Reducidos" },
                { icon: Calendar, label: "Horarios Flexibles" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon size={16} className="text-[#F9B233]" />
                  <span className="text-white/50 text-[13px]" style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ¿Para quién es? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                    ¿Para Quién Es?
                  </span>
                </div>
                <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)] leading-tight mb-6" style={{ fontWeight: 800 }}>
                  Diseñado para{" "}
                  <span className="text-[#F9B233]">Todos</span>
                </h2>
                <p className="text-[#29235C]/60 text-[16px] leading-relaxed mb-8">
                  Ya seas un profesional que busca avanzar en su carrera, un estudiante preparándose para oportunidades internacionales, o una empresa invirtiendo en su equipo — nuestro programa se adapta a tus objetivos.
                </p>

                <div className="space-y-5">
                  {[
                    { icon: Briefcase, title: "Profesionales", desc: "Impulsa tu carrera con habilidades de inglés de negocios que abren puertas a nivel global." },
                    { icon: GraduationCap, title: "Estudiantes", desc: "Construye una base sólida desde los 6 años con metodologías adecuadas para cada edad." },
                    { icon: Building2, title: "Empresas (B2B)", desc: "Capacita a tu equipo con programas corporativos personalizados." },
                    { icon: Target, title: "Certificación", desc: "Obtén certificados MCER reconocidos internacionalmente en cada nivel." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-[#29235C]/5 flex items-center justify-center shrink-0 group-hover:bg-[#29235C] transition-colors duration-300">
                        <item.icon size={20} className="text-[#29235C] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="text-[#29235C] text-[15px] mb-1" style={{ fontWeight: 700 }}>{item.title}</h4>
                        <p className="text-[#29235C]/50 text-[14px]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#29235C]/10">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1758876201853-31f6bc71f390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwbGFwdG9wJTIwc3R1ZHlpbmd8ZW58MXx8fHwxNzczNDIxMzU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Profesional estudiando"
                    className="w-full h-[500px] object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 bg-[#29235C] rounded-2xl p-5 shadow-xl hidden md:block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="text-[#F9B233] text-[28px]" style={{ fontWeight: 800 }}>6</div>
                  <div className="text-white/60 text-[12px] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Niveles MCER
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 4 Habilidades */}
      <section className="py-24 bg-[#f8f8fc]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Formación Integral
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                Cuatro Habilidades Clave
              </h2>
              <p className="text-[#29235C]/50 text-[16px] mt-4 max-w-2xl mx-auto">
                Nuestro enfoque integrado desarrolla todas las competencias comunicativas simultáneamente, asegurando dominio real del idioma.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {skills.map((skill, i) => (
              <FadeIn key={skill.name} delay={i * 0.1}>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center group hover:shadow-xl hover:shadow-[#29235C]/5 transition-all duration-500 hover:-translate-y-1 border border-[#29235C]/5 h-full">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#29235C]/5 flex items-center justify-center mx-auto mb-3 sm:mb-5 group-hover:bg-[#29235C] transition-colors duration-300">
                    <skill.icon size={20} className="sm:!w-7 sm:!h-7 text-[#29235C] group-hover:text-[#F9B233] transition-colors duration-300" />
                  </div>
                  <h3 className="text-[#29235C] text-[14px] sm:text-[18px] mb-1 sm:mb-3" style={{ fontWeight: 700 }}>{skill.name}</h3>
                  <p className="text-[#29235C]/50 text-[11px] sm:text-[14px] leading-relaxed">{skill.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Niveles MCER */}
      <section className="py-24 bg-white" id="niveles">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Tu Ruta de Aprendizaje
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                Niveles de Competencia MCER
              </h2>
              <p className="text-[#29235C]/50 text-[16px] mt-4 max-w-2xl mx-auto">
                Sigue una ruta clara y estructurada de principiante a maestría, con certificación en cada etapa.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {levels.map((level, i) => (
              <FadeIn key={level.code} delay={i * 0.08}>
                <div className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#29235C]/10 hover:border-[#29235C]/30 hover:shadow-xl hover:shadow-[#29235C]/5 transition-all duration-500 group h-full">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-[13px] sm:text-[16px]"
                      style={{ backgroundColor: level.color, fontWeight: 800 }}
                    >
                      {level.code}
                    </div>
                    <div className="flex items-center gap-1 hidden sm:flex">
                      {Array.from({ length: i + 1 }).map((_, j) => (
                        <div
                          key={j}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: level.color, opacity: 0.3 + (j * 0.14) }}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-[#29235C] text-[14px] sm:text-[17px] mb-1 sm:mb-2 leading-tight" style={{ fontWeight: 700 }}>
                    {level.name}
                  </h3>
                  <p className="text-[#29235C]/50 text-[11px] sm:text-[14px] leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                    {level.desc}
                  </p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {level.skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle size={12} className="sm:!w-3.5 sm:!h-3.5 shrink-0" style={{ color: level.color }} />
                        <span className="text-[#29235C]/60 text-[11px] sm:text-[13px]">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section className="py-24 bg-gradient-to-br from-[#29235C] to-[#1a1744] relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#F9B233]/5"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Opciones Flexibles
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-white text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                Elige tu Ritmo
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Ruta Regular",
                hours: "4 horas/semana",
                icon: Clock,
                features: [
                  "Ideal para profesionales que trabajan",
                  "Progreso constante y sostenido",
                  "Opciones diurna, nocturna y sabatina",
                  "Grupos organizados por edad y nivel",
                ],
                accent: false,
              },
              {
                title: "Ruta Intensiva",
                hours: "8-10 horas/semana",
                icon: Zap,
                features: [
                  "Camino de aprendizaje acelerado",
                  "Alcanza la fluidez más rápido",
                  "Metodología inmersiva",
                  "Ideal para transiciones de carrera",
                ],
                accent: true,
              },
            ].map((track, i) => (
              <FadeIn key={track.title} delay={i * 0.15}>
                <div className={`rounded-2xl p-8 transition-all duration-500 ${
                  track.accent
                    ? "bg-[#F9B233] text-[#29235C]"
                    : "bg-white/10 backdrop-blur-sm border border-white/10 text-white"
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <track.icon size={22} className={track.accent ? "text-[#29235C]" : "text-[#F9B233]"} />
                    <h3 className="text-[20px]" style={{ fontWeight: 700 }}>{track.title}</h3>
                  </div>
                  <div className={`text-[14px] mb-6 ${track.accent ? "text-[#29235C]/60" : "text-white/50"}`} style={{ fontWeight: 600 }}>
                    {track.hours}
                  </div>
                  <div className="space-y-3">
                    {track.features.map((f) => (
                      <div key={f} className="flex items-center gap-3">
                        <CheckCircle size={16} className={track.accent ? "text-[#29235C]/60" : "text-[#F9B233]"} />
                        <span className={`text-[14px] ${track.accent ? "text-[#29235C]/80" : "text-white/70"}`}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20ingl%C3%A9s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-8 block text-center py-3.5 rounded-xl text-[14px] tracking-wider uppercase transition-all duration-300 ${
                      track.accent
                        ? "bg-[#29235C] text-white hover:bg-[#1e1a4a]"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    Comenzar
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  ¿Por Qué Elegirnos?
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                La Ventaja CFA
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              { icon: Shield, title: "Certificación Oficial", desc: "Títulos avalados por el Ministerio de Educación Nacional de Colombia." },
              { icon: Globe, title: "Estándares MCER", desc: "Currículo alineado al Marco Común Europeo de Referencia para las Lenguas." },
              { icon: TrendingUp, title: "Crecimiento Profesional", desc: "El dominio del inglés abre puertas a mejores salarios y oportunidades globales." },
              { icon: Users, title: "Grupos Reducidos", desc: "Atención personalizada con grupos organizados por edad, nivel e intereses." },
              { icon: BookOpen, title: "Examen de Clasificación Gratis", desc: "Inicia en el nivel correcto con nuestra evaluación diagnóstica integral." },
              { icon: Award, title: "Certificación por Nivel", desc: "Recibe certificados oficiales al completar cada ciclo MCER." },
            ].map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.08}>
                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#29235C]/5 hover:shadow-lg hover:shadow-[#29235C]/5 transition-all duration-500 group h-full">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#29235C]/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#29235C] transition-colors duration-300">
                    <b.icon size={18} className="sm:!w-[22px] sm:!h-[22px] text-[#29235C] group-hover:text-[#F9B233] transition-colors duration-300" />
                  </div>
                  <h3 className="text-[#29235C] text-[13px] sm:text-[16px] mb-1 sm:mb-2 leading-tight" style={{ fontWeight: 700 }}>{b.title}</h3>
                  <p className="text-[#29235C]/50 text-[11px] sm:text-[14px] leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#f8f8fc]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Preguntas Frecuentes
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                ¿Tienes Dudas?
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 0.05}>
                <FAQ q={faq.q} a={faq.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Inscripción */}
      <section className="py-24 bg-gradient-to-br from-[#29235C] to-[#1a1744] relative overflow-hidden" id="inscripcion">
        <div className="absolute inset-0">
          <motion.div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#F9B233]/5"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                    Comienza Hoy
                  </span>
                </div>
                <h2 className="text-white text-[clamp(1.8rem,3vw,2.5rem)] leading-tight mb-6" style={{ fontWeight: 800 }}>
                  ¿Listo para Dominar
                  <br />
                  <span className="text-[#F9B233]">el Inglés?</span>
                </h2>
                <p className="text-white/50 text-[16px] leading-relaxed mb-8">
                  Da el primer paso. Llena el formulario y nuestro equipo te contactará para agendar tu examen de clasificación gratuito y encontrar el horario perfecto para ti.
                </p>
                <div className="space-y-4">
                  {[
                    "Examen de clasificación diagnóstico gratuito",
                    "Inscripciones abiertas todo el año",
                    "Opciones de pago flexibles",
                    "Certificación oficial MCER",
                    "Clases mañana, tarde y noche",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#2FAC66]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#2FAC66]" />
                      </div>
                      <span className="text-white/70 text-[14px]">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-[13px] mb-2" style={{ fontWeight: 600 }}>¿Prefieres chatear?</p>
                  <a
                    href="https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20ingl%C3%A9s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F9B233] text-[14px] hover:underline flex items-center gap-2"
                    style={{ fontWeight: 600 }}
                  >
                    <MessageSquare size={16} />
                    Contáctanos por WhatsApp
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-white text-[20px] mb-2" style={{ fontWeight: 700 }}>
                  Inscríbete en el Programa de Inglés
                </h3>
                <p className="text-white/40 text-[13px] mb-6">
                  Te contactaremos en las próximas 24 horas
                </p>
                <LeadForm variant="dark" preselectedProgram="Programa de Inglés" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
