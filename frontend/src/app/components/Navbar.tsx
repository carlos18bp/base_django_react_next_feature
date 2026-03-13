import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone, MapPin, ChevronDown } from "lucide-react";
import { programs } from "../data/programs";
import logoImg from "@/assets/logo-navbar.webp";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProgramsOpen(false);
    setMobileProgramsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProgramsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const linkStyle = "relative text-[13px] tracking-wide uppercase transition-colors duration-300 group";
  const activeClass = "text-[#29235C]";
  const inactiveClass = "text-[#29235C]/60 hover:text-[#29235C]";

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#29235C] text-white/80 hidden md:block" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center text-[12px]">
          <div className="flex items-center gap-6">
            <a href="tel:+576560903" className="flex items-center gap-2 hover:text-[#F9B233] transition-colors">
              <Phone size={12} />
              <span>(605) 656 0903</span>
            </a>
            <a href="tel:+573157766662" className="flex items-center gap-2 hover:text-[#F9B233] transition-colors">
              <Phone size={12} />
              <span>315 776 6662</span>
            </a>
            <span className="flex items-center gap-2 text-white/50">
              <MapPin size={12} />
              Pie de la Popa, Calle Real No 21-46, Cartagena
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="tracking-wider uppercase text-[10px] text-white/40">Formación para el Trabajo y el Desarrollo Humano</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-[#29235C]/5"
            : "bg-white"
        }`}
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={logoImg}
              alt="Corporación Fernando de Aragón"
              className="h-64 w-auto object-contain"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            <Link
              to="/"
              className={`${linkStyle} ${location.pathname === "/" ? activeClass : inactiveClass}`}
              style={{ fontWeight: 600 }}
            >
              Inicio
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-[#F9B233] transition-all duration-300 ${location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>

            <Link
              to="/ingles"
              className={`${linkStyle} ${location.pathname === "/ingles" ? activeClass : inactiveClass}`}
              style={{ fontWeight: 600 }}
            >
              Inglés
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-[#F9B233] transition-all duration-300 ${location.pathname === "/ingles" ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>

            {/* Programs dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProgramsOpen(!programsOpen)}
                className={`${linkStyle} flex items-center gap-1 ${programsOpen ? activeClass : inactiveClass}`}
                style={{ fontWeight: 600 }}
              >
                Programas
                <ChevronDown size={14} className={`transition-transform duration-300 ${programsOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {programsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white rounded-2xl shadow-2xl shadow-[#29235C]/10 border border-[#29235C]/5 p-4 grid grid-cols-2 gap-1"
                  >
                    {programs.filter(p => !p.featured).map((program) => (
                      <Link
                        key={program.slug}
                        to={`/${program.slug}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#29235C]/5 transition-colors group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#29235C]/5 flex items-center justify-center shrink-0 group-hover/item:bg-[#29235C] transition-colors">
                          <program.icon size={15} className="text-[#29235C] group-hover/item:text-[#F9B233] transition-colors" />
                        </div>
                        <span className="text-[12px] text-[#29235C]/70 group-hover/item:text-[#29235C] transition-colors" style={{ fontWeight: 500 }}>
                          {program.shortName}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="/#contacto"
              className={`${linkStyle} ${inactiveClass}`}
              style={{ fontWeight: 600 }}
            >
              Contacto
              <span className="absolute -bottom-1 left-0 h-[2px] bg-[#F9B233] transition-all duration-300 w-0 group-hover:w-full" />
            </a>
          </div>

          {/* CTA */}
          <div className="hidden lg:block">
            <a
              href="https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20ingl%C3%A9s"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#F9B233] text-[#29235C] px-6 py-3 rounded-full text-[13px] tracking-wide uppercase hover:bg-[#e9a020] transition-all duration-300 hover:shadow-lg hover:shadow-[#F9B233]/30"
              style={{ fontWeight: 700 }}
            >
              Inscríbete Ahora
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[#29235C] p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-24 z-40 bg-white overflow-y-auto"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <div className="flex flex-col gap-2 p-6">
              <Link to="/" className="text-[#29235C] text-[16px] py-3 border-b border-[#29235C]/5" style={{ fontWeight: 700 }}>
                Inicio
              </Link>
              <Link to="/ingles" className="text-[#29235C] text-[16px] py-3 border-b border-[#29235C]/5" style={{ fontWeight: 700 }}>
                Programa de Inglés
              </Link>

              {/* Mobile programs accordion */}
              <button
                onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
                className="flex items-center justify-between text-[#29235C] text-[16px] py-3 border-b border-[#29235C]/5 w-full text-left"
                style={{ fontWeight: 700 }}
              >
                Programas Técnicos
                <ChevronDown size={18} className={`transition-transform ${mobileProgramsOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {mobileProgramsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 space-y-1 pb-2">
                      {programs.filter(p => !p.featured).map((program) => (
                        <Link
                          key={program.slug}
                          to={`/${program.slug}`}
                          className="flex items-center gap-3 py-2.5 text-[#29235C]/70 hover:text-[#29235C] transition-colors"
                        >
                          <program.icon size={16} className="text-[#29235C]/40" />
                          <span className="text-[14px]" style={{ fontWeight: 500 }}>{program.shortName}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <a href="/#contacto" className="text-[#29235C] text-[16px] py-3 border-b border-[#29235C]/5" style={{ fontWeight: 700 }}>
                Contacto
              </a>

              <a
                href="https://wa.me/573157766662?text=Hola%2C%20me%20interesa%20el%20programa%20de%20ingl%C3%A9s"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F9B233] text-[#29235C] px-8 py-4 rounded-full text-[15px] tracking-wide uppercase text-center mt-4 block"
                style={{ fontWeight: 700 }}
              >
                Inscríbete Ahora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
