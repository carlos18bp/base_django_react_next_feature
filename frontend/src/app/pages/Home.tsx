import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  GraduationCap,
  Globe,
  Users,
  Award,
  BookOpen,
  ChevronRight,
  Star,
  Clock,
  Target,
  Building2,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import AnimatedCounter from "../components/AnimatedCounter";
import LeadForm from "../components/LeadForm";
import { programs } from "../data/programs";

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

const stats = [
  { value: 15, suffix: "+", label: "Programas Ofertados" },
  { value: 2500, suffix: "+", label: "Egresados" },
  { value: 98, suffix: "%", label: "Tasa de Empleabilidad" },
  { value: 20, suffix: "+", label: "Años de Experiencia" },
];

const testimonials = [
  {
    name: "María López",
    role: "Egresada Programa de Inglés",
    text: "El programa de inglés transformó mi carrera por completo. Pasé de comunicación básica a inglés de negocios fluido en solo 18 meses.",
    rating: 5,
  },
  {
    name: "Carlos Mendoza",
    role: "Técnico en Soporte TI",
    text: "El enfoque práctico y los instructores dedicados marcaron toda la diferencia. Conseguí mi empleo ideal a las pocas semanas de graduarme.",
    rating: 5,
  },
  {
    name: "Andrea Gutiérrez",
    role: "Auxiliar Administrativa",
    text: "Los horarios flexibles y la certificación profesional me dieron la ventaja competitiva que necesitaba. Lo recomiendo totalmente.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-[#29235C] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#29235C] via-[#1e1a4a] to-[#151238]" />
          <div className="absolute top-0 right-0 w-[60%] h-full opacity-20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1753613648120-d2c8d1d49002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwbW9kZXJufGVufDF8fHx8MTc3MzQyMTM1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Estudiantes"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#29235C] via-[#29235C]/90 to-transparent" />
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 rounded-full border border-[#F9B233]/10"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-20 right-40 w-96 h-96 rounded-full border border-white/5"
            animate={{ scale: [1.1, 1, 1.1], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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
              <Award size={14} className="text-[#F9B233]" />
              <span className="text-white/70 text-[12px] tracking-wider uppercase" style={{ fontWeight: 500 }}>
                Certificados por el Ministerio de Educación
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-white text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] mb-6"
              style={{ fontWeight: 800 }}
            >
              Construye tu Futuro
              <br />
              <span className="text-[#F9B233]">con Educación</span>
              <br />
              de Clase Mundial
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/60 text-[17px] leading-relaxed mb-10 max-w-lg"
            >
              Programas técnicos certificados y formación en inglés diseñados para impulsar tu carrera profesional. Únete a miles de egresados exitosos en Cartagena.
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
                Programa de Inglés
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#programas"
                className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-white/10 transition-all duration-300"
                style={{ fontWeight: 600 }}
              >
                Ver Programas
              </a>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#F9B233]"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-[#29235C]/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-[clamp(2rem,4vw,3rem)] text-[#29235C]" style={{ fontWeight: 800 }}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[#29235C]/40 text-[13px] tracking-wider uppercase mt-1" style={{ fontWeight: 600 }}>
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-24 bg-white" id="nosotros">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#29235C]/10">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1561089489-f13d5e730d72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0cmFpbmluZyUyMHNlbWluYXIlMjBjbGFzc3Jvb20lMjBhZHVsdHN8ZW58MXx8fHwxNzczNDIxMzU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Formación corporativa"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-[#F9B233] rounded-2xl p-6 shadow-xl hidden md:block">
                  <div className="text-[#29235C] text-[36px]" style={{ fontWeight: 800 }}>20+</div>
                  <div className="text-[#29235C]/70 text-[13px] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Años de<br />Experiencia
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                    Sobre Nosotros
                  </span>
                </div>
                <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)] leading-tight mb-6" style={{ fontWeight: 800 }}>
                  Impulsamos Carreras con{" "}
                  <span className="text-[#F9B233]">Educación de Calidad</span>
                </h2>
                <p className="text-[#29235C]/60 text-[16px] leading-relaxed mb-6">
                  La Corporación Fernando de Aragón es una institución certificada de Formación para el Trabajo y el Desarrollo Humano en Cartagena. Ofrecemos programas B2B para empresas y B2C para personas que buscan crecer profesionalmente.
                </p>
                <p className="text-[#29235C]/60 text-[16px] leading-relaxed mb-8">
                  Nuestros programas están diseñados con la empleabilidad como eje central, combinando habilidades prácticas con certificaciones reconocidas para dar a nuestros estudiantes una ventaja competitiva real.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: GraduationCap, text: "Programas Certificados" },
                    { icon: Globe, text: "Estándares Internacionales" },
                    { icon: Users, text: "Instructores Expertos" },
                    { icon: BookOpen, text: "Horarios Flexibles" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#29235C]/5 flex items-center justify-center">
                        <item.icon size={18} className="text-[#29235C]" />
                      </div>
                      <span className="text-[#29235C] text-[14px]" style={{ fontWeight: 600 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured: Programa de Inglés */}
      <section className="py-24 bg-gradient-to-br from-[#29235C] to-[#1a1744] relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#F9B233]/5"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                    Programa Destacado
                  </span>
                </div>
                <h2 className="text-white text-[clamp(1.8rem,3vw,2.5rem)] leading-tight mb-6" style={{ fontWeight: 800 }}>
                  Programa de Inglés
                </h2>
                <p className="text-white/60 text-[16px] leading-relaxed mb-8">
                  Domina el inglés desde principiante hasta avanzado con nuestro programa alineado al MCER. Elige entre la ruta regular (4h/semana) o intensiva (8-10h/semana), con certificación oficial en cada nivel.
                </p>

                <div className="flex flex-wrap gap-3 mb-10">
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((level, i) => (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white text-[14px] hover:bg-[#F9B233] hover:text-[#29235C] hover:border-[#F9B233] transition-all duration-300 cursor-pointer"
                      style={{ fontWeight: 700 }}
                    >
                      {level}
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20ingl%C3%A9s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#F9B233] text-[#29235C] px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-[#e9a020] transition-all duration-300 group"
                    style={{ fontWeight: 700 }}
                  >
                    Inscríbete Ahora
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <Link
                    to="/ingles"
                    className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-white/10 transition-all duration-300"
                    style={{ fontWeight: 600 }}
                  >
                    Conocer Más
                  </Link>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1756885375569-f04400d99cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBlbmdsaXNoJTIwY2xhc3Nyb29tJTIwc3R1ZGVudHMlMjBsZWFybmluZ3xlbnwxfHx8fDE3NzM0MjEzNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Clase de inglés"
                    className="w-full h-[450px] object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-5 shadow-xl hidden md:block"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2FAC66]/10 flex items-center justify-center">
                      <Globe size={22} className="text-[#2FAC66]" />
                    </div>
                    <div>
                      <div className="text-[#29235C] text-[14px]" style={{ fontWeight: 700 }}>Alineado al MCER</div>
                      <div className="text-[#29235C]/50 text-[12px]">Estándares Internacionales</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Programas Técnicos */}
      <section className="py-24 bg-[#f8f8fc]" id="programas">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Nuestra Oferta
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                Programas Profesionales
              </h2>
              <p className="text-[#29235C]/50 text-[16px] mt-4 max-w-2xl mx-auto">
                Elige entre nuestra amplia oferta de programas técnicos certificados, diseñados para impulsar tu empleabilidad y abrir nuevas oportunidades.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {programs.map((program, i) => (
              <FadeIn key={program.slug} delay={i * 0.05}>
                <Link
                  to={program.featured ? "/ingles" : `/${program.slug}`}
                  className={`group relative block rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-500 hover:-translate-y-1 h-full ${
                    program.featured
                      ? "bg-[#29235C] text-white shadow-xl shadow-[#29235C]/20"
                      : "bg-white border border-[#29235C]/5 hover:shadow-xl hover:shadow-[#29235C]/10"
                  }`}
                >
                  {program.featured && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#F9B233] text-[#29235C] text-[8px] sm:text-[10px] tracking-wider uppercase px-2 sm:px-3 py-0.5 sm:py-1 rounded-full" style={{ fontWeight: 700 }}>
                      Destacado
                    </div>
                  )}
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${
                    program.featured ? "bg-white/10" : "bg-[#29235C]/5"
                  }`}>
                    <program.icon size={18} className={`sm:!w-[22px] sm:!h-[22px] ${program.featured ? "text-[#F9B233]" : "text-[#29235C]"}`} />
                  </div>
                  <h3
                    className={`text-[13px] sm:text-[15px] mb-1 sm:mb-2 leading-tight ${program.featured ? "text-white" : "text-[#29235C]"}`}
                    style={{ fontWeight: 700 }}
                  >
                    {program.shortName}
                  </h3>
                  <p className={`text-[11px] sm:text-[13px] mb-3 sm:mb-4 line-clamp-3 leading-relaxed ${program.featured ? "text-white/50" : "text-[#29235C]/50"}`}>
                    {program.description}
                  </p>
                  <div className={`flex items-center gap-1 text-[11px] sm:text-[12px] tracking-wider uppercase ${
                    program.featured ? "text-[#F9B233]" : "text-[#29235C]/60 group-hover:text-[#29235C]"
                  }`} style={{ fontWeight: 600 }}>
                    Conocer Más
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Nuestras Ventajas
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                ¿Por qué la Corporación Fernando de Aragón?
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              { icon: Award, title: "Certificación Oficial", desc: "Títulos avalados por el Ministerio de Educación Nacional de Colombia." },
              { icon: Target, title: "Enfoque en Empleabilidad", desc: "Programas diseñados para que consigas empleo rápidamente al graduarte." },
              { icon: Clock, title: "Horarios Flexibles", desc: "Jornadas diurna, nocturna y sabatina para que estudies sin descuidar tu trabajo." },
              { icon: Users, title: "Instructores Calificados", desc: "Docentes con experiencia real en la industria y vocación de servicio." },
              { icon: Building2, title: "Formación B2B y B2C", desc: "Capacitación corporativa para empresas y programas individuales." },
              { icon: Globe, title: "En el Corazón de Cartagena", desc: "Ubicados en Pie de la Popa, con fácil acceso desde toda la ciudad." },
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

      {/* Testimonios */}
      <section className="py-24 bg-[#f8f8fc]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                  Historias de Éxito
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2 className="text-[#29235C] text-[clamp(1.8rem,3vw,2.5rem)]" style={{ fontWeight: 800 }}>
                Lo que Dicen Nuestros Egresados
              </h2>
            </div>
          </FadeIn>

          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1} className="snap-center shrink-0 w-[85%] md:w-auto">
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 relative group hover:shadow-xl hover:shadow-[#29235C]/5 transition-all duration-500 h-full">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="sm:!w-4 sm:!h-4 text-[#F9B233] fill-[#F9B233]" />
                    ))}
                  </div>
                  <p className="text-[#29235C]/70 text-[13px] sm:text-[15px] leading-relaxed mb-4 sm:mb-6 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#29235C] flex items-center justify-center text-white text-[12px] sm:text-[14px]" style={{ fontWeight: 700 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-[#29235C] text-[13px] sm:text-[14px]" style={{ fontWeight: 700 }}>{t.name}</div>
                      <div className="text-[#29235C]/40 text-[11px] sm:text-[12px]">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Formulario */}
      <section className="py-24 bg-gradient-to-br from-[#29235C] to-[#1a1744] relative overflow-hidden" id="contacto">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#F9B233]/5"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
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
                  Da el Primer Paso<br />
                  <span className="text-[#F9B233]">Hacia tu Futuro</span>
                </h2>
                <p className="text-white/50 text-[16px] leading-relaxed mb-8">
                  Llena el formulario y nuestro equipo de admisiones te contactará en las próximas 24 horas con toda la información que necesitas para iniciar tu nuevo camino profesional.
                </p>
                <div className="space-y-4">
                  {[
                    "Prueba de clasificación gratuita para inglés",
                    "Planes de pago flexibles",
                    "Jornadas diurna, nocturna y sabatina",
                    "Títulos certificados por el Ministerio de Educación",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#2FAC66]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#2FAC66]" />
                      </div>
                      <span className="text-white/70 text-[14px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-white text-[20px] mb-6" style={{ fontWeight: 700 }}>
                  Solicita Información
                </h3>
                <LeadForm variant="dark" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
