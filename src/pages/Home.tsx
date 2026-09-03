import { Link } from 'react-router-dom';
import { ArrowRight, Target, Briefcase, GraduationCap, ChevronRight, Activity, ShieldCheck, FileCheck, Layers } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-finvantage-navy text-white pt-24 pb-20 lg:pt-32 lg:pb-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-finvantage-accent text-sm font-semibold mb-6 tracking-wide">
                <Target className="w-4 h-4" />
                <span>Pre-Vetted Banking Professionals</span>
              </div>
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
                Pre-Vetted Banking Professionals for <span className="text-transparent bg-clip-text bg-gradient-to-r from-finvantage-accent to-emerald-400">Immediate Corporate Value</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Connecting Institutions. Developing Talent. Enabling Careers. 
                FinVantage ensures every entry-level professional deployed delivers immediate corporate value.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/for-banks" className="bg-finvantage-accent hover:bg-emerald-600 text-white px-6 py-3.5 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2 group shadow-sm">
                  For Corporate Clients 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/for-colleges" className="bg-transparent hover:bg-white/5 border border-white/30 text-white px-6 py-3.5 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2">
                  For Sourcing Partners
                </Link>
              </div>
            </div>

            {/* Right Structural Element */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-finvantage-accent/20 rounded-full blur-2xl"></div>
                
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-finvantage-accent" />
                  Our Core Methodology
                </h3>
                <p className="text-xs text-finvantage-accent/80 font-bold uppercase tracking-wider mb-6">Condensed 4-Step Overview</p>
                
                <ul className="space-y-5">
                  {[
                    { title: 'Identify', desc: 'Targeted sourcing from premier colleges' },
                    { title: 'Assess', desc: 'Rigorous quantitative & behavioural screening' },
                    { title: 'Prepare', desc: 'Intensive banking-readiness bootcamps' },
                    { title: 'Connect', desc: 'Direct placement in frontline roles' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-white/10 text-finvantage-accent flex items-center justify-center font-bold text-sm mr-4 shrink-0 border border-white/5">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-base">{item.title}</h4>
                        <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    * The complete 6-stage engineering pipeline is detailed below.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-finvantage-accent/5 blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/4"></div>
      </section>

      {/* Dual Network Ecosystem Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-finvantage-navy mb-4 tracking-tight">The Dual-Network Ecosystem</h2>
            <p className="text-lg text-finvantage-slate max-w-2xl mx-auto">
              FinVantage serves as the strategic integration partner, seamlessly connecting academia with corporate banking.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Desktop Connectors (Lines) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-gray-200 via-finvantage-accent to-gray-200 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10">
              {/* Backward Chain */}
              <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center transform transition-transform hover:-translate-y-1 duration-300">
                <div className="w-16 h-16 rounded-full bg-finvantage-light flex items-center justify-center mb-6 text-finvantage-navy ring-4 ring-white shadow-sm">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-finvantage-navy mb-1">Backward Chain</h3>
                <p className="text-xs font-bold text-finvantage-accent uppercase tracking-wider mb-4">Sourcing Partners</p>
                <p className="text-sm text-finvantage-slate leading-relaxed">
                  Colleges & Universities providing students with direct, premier BFSI career pathways.
                </p>
              </div>

              {/* FinVantage Partner */}
              <div className="bg-finvantage-navy p-8 rounded-xl shadow-[0_8px_30px_-4px_rgba(15,41,66,0.3)] border border-finvantage-navy flex flex-col items-center text-center transform md:scale-110 z-20">
                <div className="w-16 h-16 rounded-full bg-finvantage-accent flex items-center justify-center mb-6 text-white ring-4 ring-finvantage-navy shadow-inner">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">FinVantage</h3>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">Strategic Integration Partner</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A closed-loop ecosystem evaluating and preparing talent for immediate deployment.
                </p>
              </div>

              {/* Forward Chain */}
              <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center transform transition-transform hover:-translate-y-1 duration-300">
                <div className="w-16 h-16 rounded-full bg-finvantage-light flex items-center justify-center mb-6 text-finvantage-navy ring-4 ring-white shadow-sm">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-finvantage-navy mb-1">Forward Chain</h3>
                <p className="text-xs font-bold text-finvantage-accent uppercase tracking-wider mb-4">Corporate Clients</p>
                <p className="text-sm text-finvantage-slate leading-relaxed">
                  Banks & NBFCs accessing pre-vetted, compliant professionals ready for execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Talent Pipeline Section */}
      <section className="py-24 bg-finvantage-light border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Mission & Fitment Matrix */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-finvantage-navy mb-6 tracking-tight">
                Evaluating Talent via The Fitment Matrix
              </h2>
              <p className="text-lg text-finvantage-slate leading-relaxed mb-10">
                Our proprietary assessment engine rigorously evaluates candidates across multiple dimensions, guaranteeing that our corporate partners interview only the most capable talent.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'Phase 1: Quantitative & Analytical', desc: 'Core reasoning and numerical aptitude crucial for financial analysis.', icon: FileCheck },
                  { title: 'Phase 2: Banking Ops & Compliance', desc: 'Domain-specific knowledge ensuring regulatory readiness from day one.', icon: ShieldCheck },
                  { title: 'Phase 3: Behavioural & Stress Mocks', desc: 'Simulated corporate scenarios testing resilience and cultural fit.', icon: Activity }
                ].map((phase, i) => {
                  const Icon = phase.icon;
                  return (
                    <div key={i} className="group bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-finvantage-accent/50 transition-all cursor-default">
                      <div className="flex items-start">
                        <div className="bg-finvantage-light rounded-md p-2 mr-4 group-hover:bg-finvantage-accent/10 group-hover:text-finvantage-accent transition-colors text-finvantage-slate">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-finvantage-navy font-bold text-base mb-1">{phase.title}</h4>
                          <p className="text-sm text-finvantage-slate leading-relaxed">{phase.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Right: The Pipeline Steps */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-finvantage-navy mb-8 flex items-center">
                Engineering the Talent Pipeline
              </h3>
              
              <div className="relative">
                {/* Connecting subtle line */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200 z-0"></div>
                
                <div className="space-y-6 relative z-10">
                  {[
                    'Requirement Mapping',
                    'Talent Sourcing (Colleges/Institutes)',
                    'Screening (Quantitative & Behavioural)',
                    'Banking-Readiness Bootcamps',
                    'Interview Management',
                    'Pre-joining Support'
                  ].map((step, i) => (
                    <div key={i} className="flex items-center group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-5 shrink-0 transition-colors ${
                        i === 2 ? 'bg-finvantage-accent text-white ring-4 ring-white shadow-sm' : 'bg-finvantage-light text-finvantage-navy group-hover:bg-finvantage-navy group-hover:text-white'
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`text-base font-medium transition-colors ${
                        i === 2 ? 'text-finvantage-accent font-bold' : 'text-finvantage-slate group-hover:text-finvantage-navy'
                      }`}>
                        {step}
                      </span>
                      {i === 2 && (
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-finvantage-accent/10 text-finvantage-accent px-2 py-1 rounded-sm">
                          Core Module
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-100">
                <Link to="/pipeline" className="text-finvantage-accent font-semibold hover:text-emerald-700 transition-colors flex items-center text-sm uppercase tracking-wide">
                  Explore the full pipeline <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
