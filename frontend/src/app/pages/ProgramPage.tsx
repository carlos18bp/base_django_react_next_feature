import { useRef } from "react";
import { useParams, Link } from "react-router";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Award,
  CheckCircle,
  ChevronLeft,
  MessageSquare,
  Users,
  BookOpen,
  Briefcase,
  GraduationCap,
  FileText,
  Star,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import LeadForm from "../components/LeadForm";
import { programs } from "../data/programs";
import CurriculumSection from "../components/CurriculumSection";

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-80px",
  });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProgramPage() {
  const { slug } = useParams();
  const program = programs.find((p) => p.slug === slug);

  if (!program) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <div className="text-center">
          <h1
            className="text-[#29235C] text-[2rem] mb-4"
            style={{ fontWeight: 800 }}
          >
            Programa no encontrado
          </h1>
          <p className="text-[#29235C]/50 mb-6">
            El programa que buscas no existe o fue movido.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#F9B233] text-[#29235C] px-6 py-3 rounded-full text-[14px]"
            style={{ fontWeight: 700 }}
          >
            <ChevronLeft size={16} />
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const Icon = program.icon;
  const relatedPrograms = programs
    .filter((p) => p.slug !== slug && !p.featured)
    .slice(0, 3);

  return (
    <div
      className="overflow-hidden"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-[#29235C] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#29235C] via-[#1e1a4a] to-[#151238]" />
          <div className="absolute top-0 right-0 w-[55%] h-full opacity-30">
            <ImageWithFallback
              src={program.heroImage}
              alt={program.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#29235C] via-[#29235C]/85 to-transparent" />
          <motion.div
            className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border border-[#F9B233]/10"
            animate={{ rotate: 360 }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-[250px] h-[250px] rounded-full border border-white/5"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-[13px] mb-8 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ChevronLeft size={16} />
            Volver al Inicio
          </Link>

          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-6"
            >
              <Award size={14} className="text-[#F9B233]" />
              <span
                className="text-white/70 text-[12px] tracking-wider uppercase"
                style={{ fontWeight: 500 }}
              >
                Técnico Laboral por Competencias
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-5 mb-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-1">
                <Icon size={32} className="text-[#F9B233]" />
              </div>
              <h1
                className="text-white text-[clamp(1.6rem,4vw,2.8rem)] leading-tight"
                style={{ fontWeight: 800 }}
              >
                {program.name}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-[17px] leading-relaxed mb-8 max-w-2xl"
            >
              {program.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              {[
                { icon: Clock, label: program.duration },
                {
                  icon: MapPin,
                  label: "Presencial - Cartagena",
                },
                { icon: Calendar, label: program.schedule },
                { icon: Users, label: "Máx. 25 estudiantes" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                >
                  <item.icon
                    size={14}
                    className="text-[#F9B233]"
                  />
                  <span
                    className="text-white/60 text-[13px]"
                    style={{ fontWeight: 500 }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href={`https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20${encodeURIComponent(program.shortName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#F9B233] text-[#29235C] px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-[#e9a020] transition-all duration-300 hover:shadow-xl hover:shadow-[#F9B233]/20 group"
                style={{ fontWeight: 700 }}
              >
                Solicitar Información
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="#inscripcion"
                className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 rounded-full text-[14px] tracking-wider uppercase hover:bg-white/10 transition-all duration-300"
                style={{ fontWeight: 600 }}
              >
                Más Info
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Objetivo + Imagen */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span
                    className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase"
                    style={{ fontWeight: 700 }}
                  >
                    Sobre el Programa
                  </span>
                </div>
                <h2
                  className="text-[#29235C] text-[clamp(1.6rem,3vw,2.2rem)] leading-tight mb-6"
                  style={{ fontWeight: 800 }}
                >
                  Objetivo del Programa
                </h2>
                <p className="text-[#29235C]/60 text-[16px] leading-relaxed mb-8">
                  {program.objective}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: Clock,
                      label: "Duración",
                      value: program.duration,
                    },
                    {
                      icon: BookOpen,
                      label: "Módulos",
                      value: program.modules
                        .split("+")[0]
                        .trim(),
                    },
                    {
                      icon: Calendar,
                      label: "Modalidad",
                      value: program.modality,
                    },
                    {
                      icon: GraduationCap,
                      label: "Certificación",
                      value: "Técnico Laboral",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-[#f8f8fc] rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon
                          size={15}
                          className="text-[#29235C]/40"
                        />
                        <span
                          className="text-[#29235C]/40 text-[11px] tracking-wider uppercase"
                          style={{ fontWeight: 600 }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className="text-[#29235C] text-[14px]"
                        style={{ fontWeight: 600 }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#29235C]/10">
                  <ImageWithFallback
                    src={program.heroImage}
                    alt={program.name}
                    className="w-full h-[420px] object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-5 -left-5 bg-[#F9B233] rounded-2xl p-5 shadow-xl hidden md:block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div
                    className="text-[#29235C] text-[28px]"
                    style={{ fontWeight: 800 }}
                  >
                    {program.duration.split(" ")[0]}
                  </div>
                  <div
                    className="text-[#29235C]/70 text-[11px] uppercase tracking-wider"
                    style={{ fontWeight: 600 }}
                  >
                    {program.duration.includes("horas")
                      ? "Horas de\nFormación"
                      : "Programa\nCompleto"}
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Perfil + Funciones */}
      <section className="py-24 bg-[#f8f8fc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <FadeIn>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span
                    className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase"
                    style={{ fontWeight: 700 }}
                  >
                    Perfil del Egresado
                  </span>
                </div>
                <h2
                  className="text-[#29235C] text-[clamp(1.4rem,2.5vw,1.8rem)] leading-tight mb-6"
                  style={{ fontWeight: 800 }}
                >
                  ¿Qué podrás hacer al graduarte?
                </h2>
                <p className="text-[#29235C]/60 text-[15px] leading-relaxed mb-8">
                  {program.profile}
                </p>
                <div className="space-y-3">
                  {program.functions.map((fn) => (
                    <div
                      key={fn}
                      className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#29235C]/5"
                    >
                      <CheckCircle
                        size={18}
                        className="text-[#2FAC66] mt-0.5 shrink-0"
                      />
                      <span className="text-[#29235C]/70 text-[14px] leading-relaxed">
                        {fn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[2px] bg-[#F9B233]" />
                  <span
                    className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase"
                    style={{ fontWeight: 700 }}
                  >
                    Salidas Laborales
                  </span>
                </div>
                <h2
                  className="text-[#29235C] text-[clamp(1.4rem,2.5vw,1.8rem)] leading-tight mb-6"
                  style={{ fontWeight: 800 }}
                >
                  Oportunidades de Empleo
                </h2>
                <p className="text-[#29235C]/60 text-[15px] leading-relaxed mb-8">
                  Al obtener tu título, podrás desempeñarte en
                  diferentes cargos tanto en el sector público
                  como privado:
                </p>
                <div className="space-y-3 mb-10">
                  {program.jobTitles.map((title, i) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#29235C]/5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#29235C]/5 flex items-center justify-center shrink-0">
                        <Briefcase
                          size={15}
                          className="text-[#29235C]"
                        />
                      </div>
                      <span
                        className="text-[#29235C] text-[14px]"
                        style={{ fontWeight: 600 }}
                      >
                        {title}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-[#29235C] rounded-2xl p-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <FileText
                        size={22}
                        className="text-[#F9B233]"
                      />
                    </div>
                    <div>
                      <div
                        className="text-[11px] tracking-wider uppercase text-white/40 mb-1"
                        style={{ fontWeight: 600 }}
                      >
                        Título a obtener
                      </div>
                      <div
                        className="text-[14px] leading-relaxed"
                        style={{ fontWeight: 600 }}
                      >
                        {program.certification}
                      </div>
                      <div className="text-[12px] text-white/40 mt-1">
                        Avalado por el Ministerio de Educación
                        Nacional
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ¿Por qué estudiar esto? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span
                  className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase"
                  style={{ fontWeight: 700 }}
                >
                  Ventajas
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2
                className="text-[#29235C] text-[clamp(1.6rem,3vw,2.2rem)]"
                style={{ fontWeight: 800 }}
              >
                ¿Por qué estudiar {program.shortName}?
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {program.whyStudy.map((reason, i) => (
              <FadeIn key={reason} delay={i * 0.1}>
                <div className="bg-[#f8f8fc] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group hover:shadow-xl hover:shadow-[#29235C]/5 transition-all duration-500 hover:-translate-y-1 border border-[#29235C]/5 h-full flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#29235C]/5 flex items-center justify-center mb-3 sm:mb-5 group-hover:bg-[#29235C] transition-colors duration-300">
                    <Star
                      size={18}
                      className="sm:!w-6 sm:!h-6 text-[#29235C] group-hover:text-[#F9B233] transition-colors duration-300"
                    />
                  </div>
                  <p
                    className="text-[#29235C] text-[12px] sm:text-[14px] leading-relaxed"
                    style={{ fontWeight: 600 }}
                  >
                    {reason}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Malla Curricular */}
      {slug && <CurriculumSection slug={slug} />}

      {/* Otros programas */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-[2px] bg-[#F9B233]" />
                <span
                  className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase"
                  style={{ fontWeight: 700 }}
                >
                  Explora Más
                </span>
                <span className="w-10 h-[2px] bg-[#F9B233]" />
              </div>
              <h2
                className="text-[#29235C] text-[clamp(1.4rem,2.5vw,1.8rem)]"
                style={{ fontWeight: 800 }}
              >
                Otros Programas que te Pueden Interesar
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {relatedPrograms.map((rp, i) => {
              const RpIcon = rp.icon;
              return (
                <FadeIn key={rp.slug} delay={i * 0.1}>
                  <Link
                    to={`/${rp.slug}`}
                    className="group block bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#29235C]/5 hover:shadow-xl hover:shadow-[#29235C]/10 transition-all duration-500 hover:-translate-y-1 h-full"
                  >
                    <div className="h-28 sm:h-44 overflow-hidden">
                      <ImageWithFallback
                        src={rp.heroImage}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-3 sm:p-5">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-[#29235C]/5 flex items-center justify-center shrink-0">
                          <RpIcon
                            size={14}
                            className="sm:!w-[17px] sm:!h-[17px] text-[#29235C]"
                          />
                        </div>
                        <h3
                          className="text-[#29235C] text-[12px] sm:text-[14px] leading-tight"
                          style={{ fontWeight: 700 }}
                        >
                          {rp.shortName}
                        </h3>
                      </div>
                      <p className="text-[#29235C]/50 text-[11px] sm:text-[13px] leading-relaxed mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
                        {rp.description}
                      </p>
                      <div
                        className="flex items-center gap-1 text-[#F9B233] text-[11px] sm:text-[12px] tracking-wider uppercase"
                        style={{ fontWeight: 600 }}
                      >
                        Conocer Más
                        <ArrowRight
                          size={13}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA / Formulario */}
      <section
        className="py-24 bg-gradient-to-br from-[#29235C] to-[#1a1744] relative overflow-hidden"
        id="inscripcion"
      >
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
                  <span
                    className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase"
                    style={{ fontWeight: 700 }}
                  >
                    Inscríbete
                  </span>
                </div>
                <h2
                  className="text-white text-[clamp(1.6rem,3vw,2.2rem)] leading-tight mb-6"
                  style={{ fontWeight: 800 }}
                >
                  ¿Listo para estudiar{" "}
                  <span className="text-[#F9B233]">
                    {program.shortName}
                  </span>
                  ?
                </h2>
                <p className="text-white/50 text-[16px] leading-relaxed mb-8">
                  Llena el formulario y nuestro equipo de
                  admisiones te contactará con toda la
                  información sobre horarios disponibles, costos
                  y proceso de matrícula.
                </p>
                <div className="space-y-4">
                  {[
                    "Asesoría personalizada sin compromiso",
                    "Planes de pago flexibles disponibles",
                    "Próximo inicio de clases disponible",
                    "Título certificado por el Ministerio de Educación",
                    `${program.duration} de formación integral`,
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#2FAC66]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#2FAC66]" />
                      </div>
                      <span className="text-white/70 text-[14px]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-10 p-5 rounded-xl bg-white/5 border border-white/10">
                  <p
                    className="text-white/40 text-[13px] mb-2"
                    style={{ fontWeight: 600 }}
                  >
                    ¿Prefieres chatear?
                  </p>
                  <a
                    href={`https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20${encodeURIComponent(program.shortName)}`}
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
                <h3
                  className="text-white text-[20px] mb-2"
                  style={{ fontWeight: 700 }}
                >
                  Solicita Información
                </h3>
                <p className="text-white/40 text-[13px] mb-6">
                  Te contactaremos en las próximas 24 horas
                </p>
                <LeadForm
                  variant="dark"
                  preselectedProgram={program.name}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}