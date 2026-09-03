import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Landmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from '../../lib/auth-client';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { data: session } = useSession();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'For Banks & NBFCs', path: '/for-banks' },
    { name: 'For Colleges', path: '/for-colleges' },
    { name: 'Pipeline', path: '/pipeline' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <nav className="bg-finvantage-navy text-white sticky top-0 z-50 border-b border-white/10 shadow-sm backdrop-blur-md bg-finvantage-navy/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                <Landmark className="h-7 w-7 text-finvantage-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-none tracking-tight text-white mb-0.5">FINVANTAGE</span>
                <span className="text-[0.6rem] text-gray-400 uppercase tracking-[0.2em] leading-none font-semibold">Banking Talent Partners</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive 
                        ? 'text-white bg-white/10' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pl-4 flex items-center space-x-2">
                <div className="pr-2 border-r border-gray-700 h-6"></div>
                {session ? (
                  <Link
                    to="/app"
                    className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2.5 rounded-md text-sm font-medium transition-all"
                    >
                      Register
                    </Link>
                  </>
                )}
                <Link 
                  to="/contact" 
                  className="bg-finvantage-accent hover:bg-emerald-600 text-white ml-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm inline-flex items-center justify-center"
                >
                  Partner With Us
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[32rem] border-t border-white/10 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 bg-finvantage-navy shadow-inner">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-2 border-t border-white/10 flex flex-col space-y-2">
            {session ? (
              <Link
                to="/app"
                className="block px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 rounded-lg text-base font-medium transition-colors text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Register
                </Link>
              </>
            )}
            <Link
              to="/contact"
              className="block w-full text-center mt-2 bg-finvantage-accent hover:bg-emerald-600 text-white px-4 py-3 rounded-lg text-base font-semibold transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
