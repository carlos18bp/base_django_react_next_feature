import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import { programs } from "../data/programs";
import logoFooter from "@/assets/logo-footer.webp";

export default function Footer() {
  return (
    <footer className="bg-[#29235C] text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img
                src={logoFooter}
                alt="Corporación Fernando de Aragón"
                className="h-64 w-auto object-contain"
              />
            </div>
            <p className="text-white/50 text-[14px] leading-relaxed mb-6">
              Institución de Formación para el Trabajo y el Desarrollo Humano, certificada por el Ministerio de Educación. Transformamos vidas a través de educación técnica de calidad.
            </p>
            <div className="flex items-center gap-2 text-[#F9B233] text-[11px] tracking-wider uppercase" style={{ fontWeight: 600 }}>
              <span className="w-8 h-[1px] bg-[#F9B233]" />
              NIT: 900325626
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-[13px] tracking-[0.2em] uppercase text-white/40 mb-6" style={{ fontWeight: 600 }}>
              Enlaces Rápidos
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Inicio", href: "/" },
                { label: "Programa de Inglés", href: "/ingles" },
                { label: "Todos los Programas", href: "/#programas" },
                { label: "Contacto", href: "/#contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="flex items-center gap-2 text-white/70 hover:text-[#F9B233] transition-colors text-[14px]">
                    <ChevronRight size={14} className="text-[#F9B233]/50" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programas */}
          <div>
            <h4 className="text-[13px] tracking-[0.2em] uppercase text-white/40 mb-6" style={{ fontWeight: 600 }}>
              Programas
            </h4>
            <ul className="space-y-3">
              {programs.slice(0, 8).map((p) => (
                <li key={p.slug}>
                  <Link to={`/${p.slug}`} className="flex items-center gap-2 text-white/70 hover:text-[#F9B233] transition-colors text-[13px]">
                    <ChevronRight size={12} className="text-[#F9B233]/50" />
                    {p.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-[13px] tracking-[0.2em] uppercase text-white/40 mb-6" style={{ fontWeight: 600 }}>
              Contáctenos
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#F9B233] mt-0.5 shrink-0" />
                <span className="text-white/70 text-[14px]">Pie de la Popa, Calle Real No 21-46, Cartagena, Bolívar</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#F9B233] mt-0.5 shrink-0" />
                <div className="text-white/70 text-[14px]">
                  <div>(605) 656 0903</div>
                  <div>315 776 6662</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#F9B233] mt-0.5 shrink-0" />
                <span className="text-white/70 text-[14px]">info@fernandoaragon.edu.co</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="text-[#F9B233] mt-0.5 shrink-0" />
                <span className="text-white/70 text-[14px]">Lun - Sáb: 7:00 AM - 9:30 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-[13px]">
            &copy; {new Date().getFullYear()} Corporación Fernando de Aragón. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-white/30 text-[13px]">
            <span className="hover:text-white/50 cursor-pointer transition-colors">Política de Privacidad</span>
            <span className="hover:text-white/50 cursor-pointer transition-colors">Términos de Servicio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
