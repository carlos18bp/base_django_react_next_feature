import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { BookOpen, Briefcase, Target } from "lucide-react";
import { curriculumBySlug } from "../data/curriculum";

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

interface CurriculumSectionProps {
  slug: string;
}

export default function CurriculumSection({ slug }: CurriculumSectionProps) {
  const curriculum = curriculumBySlug[slug];
  if (!curriculum) return null;

  const basicModules = curriculum.modules.filter((m) => m.type === "basic");
  const technicalModules = curriculum.modules.filter((m) => m.type === "technical");
  const basicTotal = basicModules.reduce((s, m) => s + m.hours, 0);
  const technicalTotal = technicalModules.reduce((s, m) => s + m.hours, 0);
  const maxHours = Math.max(...curriculum.modules.map((m) => m.hours));

  return (
    <section className="py-24 bg-[#f8f8fc]" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-[2px] bg-[#F9B233]" />
              <span className="text-[#F9B233] text-[12px] tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>
                Plan de Estudios
              </span>
              <span className="w-10 h-[2px] bg-[#F9B233]" />
            </div>
            <h2 className="text-[#29235C] text-[clamp(1.6rem,3vw,2.2rem)]" style={{ fontWeight: 800 }}>
              ¿En qué se van las {curriculum.totalHours.toLocaleString()} horas?
            </h2>
            <p className="text-[#29235C]/50 text-[15px] mt-4 max-w-2xl mx-auto">
              Nuestro programa combina competencias básicas y técnicas con enfoque 50% teórico y 50% práctico.
            </p>
          </div>
        </FadeIn>

        {/* Summary cards */}
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Comp. Básicas", value: `${basicTotal}h`, color: "#29235C" },
              { label: "Comp. Técnicas", value: `${technicalTotal}h`, color: "#F9B233" },
              { label: "Práctica Laboral", value: curriculum.practiceHours > 0 ? `${curriculum.practiceHours}h` : "Integrada", color: "#2FAC66" },
              { label: "Total Programa", value: `${curriculum.totalHours.toLocaleString()}h`, color: "#A8151C" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl p-5 border border-[#29235C]/5 text-center">
                <div className="text-[28px]" style={{ fontWeight: 800, color: card.color }}>{card.value}</div>
                <div className="text-[#29235C]/40 text-[11px] tracking-wider uppercase mt-1" style={{ fontWeight: 600 }}>{card.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Competencias Básicas */}
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl p-6 border border-[#29235C]/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#29235C]/5 flex items-center justify-center">
                  <BookOpen size={18} className="text-[#29235C]" />
                </div>
                <div>
                  <h3 className="text-[#29235C] text-[16px]" style={{ fontWeight: 700 }}>Competencias Básicas</h3>
                  <span className="text-[#29235C]/40 text-[12px]">{basicTotal} horas totales</span>
                </div>
              </div>
              <div className="space-y-3">
                {basicModules.map((mod, i) => (
                  <motion.div
                    key={mod.name}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#29235C]/70 text-[13px]" style={{ fontWeight: 500 }}>{mod.name}</span>
                      <span className="text-[#29235C] text-[13px] shrink-0 ml-3" style={{ fontWeight: 700 }}>{mod.hours}h</span>
                    </div>
                    <div className="w-full h-2 bg-[#29235C]/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#29235C]/20"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(mod.hours / maxHours) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Competencias Técnicas */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl p-6 border border-[#29235C]/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F9B233]/10 flex items-center justify-center">
                  <Target size={18} className="text-[#F9B233]" />
                </div>
                <div>
                  <h3 className="text-[#29235C] text-[16px]" style={{ fontWeight: 700 }}>Competencias Técnicas</h3>
                  <span className="text-[#29235C]/40 text-[12px]">{technicalTotal} horas totales</span>
                </div>
              </div>
              <div className="space-y-3">
                {technicalModules.map((mod, i) => (
                  <motion.div
                    key={mod.name}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#29235C]/70 text-[13px]" style={{ fontWeight: 500 }}>{mod.name}</span>
                      <span className="text-[#F9B233] text-[13px] shrink-0 ml-3" style={{ fontWeight: 700 }}>{mod.hours}h</span>
                    </div>
                    <div className="w-full h-2 bg-[#F9B233]/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#F9B233]/40"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(mod.hours / maxHours) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Práctica laboral highlight */}
        {curriculum.practiceHours > 0 && (
          <FadeIn delay={0.3}>
            <div className="mt-8 bg-[#29235C] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2FAC66]/20 flex items-center justify-center shrink-0">
                  <Briefcase size={22} className="text-[#2FAC66]" />
                </div>
                <div>
                  <div className="text-white text-[15px]" style={{ fontWeight: 700 }}>Práctica Laboral Externa</div>
                  <div className="text-white/50 text-[13px]">Experiencia real en empresas del sector</div>
                </div>
              </div>
              <div className="text-[#F9B233] text-[32px]" style={{ fontWeight: 800 }}>{curriculum.practiceHours}h</div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
