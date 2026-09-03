import { Link } from 'react-router-dom';
import { Landmark, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-finvantage-navy text-gray-300 pt-16 pb-8 border-t-[6px] border-finvantage-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                <Landmark className="h-6 w-6 text-finvantage-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-none tracking-tight text-white mb-0.5">FINVANTAGE</span>
                <span className="text-[0.6rem] text-gray-400 uppercase tracking-[0.2em] leading-none font-semibold">Banking Talent Partners</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Specialist Talent Acquisition for Banking & NBFCs. Connecting Institutions. Developing Talent. Enabling Careers. We ensure every deployed professional delivers immediate corporate value.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Solutions</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/for-banks" className="text-gray-400 hover:text-finvantage-accent transition-colors">For Banks & NBFCs</Link></li>
              <li><Link to="/for-colleges" className="text-gray-400 hover:text-finvantage-accent transition-colors">For Colleges & Universities</Link></li>
              <li><Link to="/pipeline" className="text-gray-400 hover:text-finvantage-accent transition-colors">The Talent Pipeline</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-finvantage-accent transition-colors">Our Practice</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-finvantage-accent transition-colors">Architectural Foundation</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-finvantage-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                <span className="text-gray-400 leading-relaxed">FinVantage HR Advisory LLP<br/>401-404, Corporate Financial Tower,<br/>Connaught Place, New Delhi - 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-gray-400">Hotlines: +91-98765-XXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-gray-400">contact@finvantagehr.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p>&copy; {new Date().getFullYear()} FinVantage HR Advisory LLP. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
