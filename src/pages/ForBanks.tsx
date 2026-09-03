import { Briefcase, CheckCircle2, ChevronRight, ShieldCheck, Target, Users, GitMerge } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForBanks = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-finvantage-navy text-white pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-finvantage-accent text-sm font-semibold mb-6 tracking-wide uppercase">
                Forward Chain
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
                For Corporate Clients
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Optimise your talent pipeline with pre-vetted, compliant banking professionals ready for frontline execution.
              </p>
              <Link to="/contact" className="bg-finvantage-accent hover:bg-emerald-600 text-white px-8 py-3.5 rounded-lg font-semibold text-base transition-colors inline-flex items-center gap-2 group shadow-sm">
                Partner with FinVantage <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Right Visual Rep (Premium, Abstract Ecosystem Flow) */}
            <div className="hidden lg:block relative h-full">
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[110%]">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-finvantage-accent/20 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col gap-5">
                    
                    {/* Node 1: Sourcing */}
                    <div className="flex items-center gap-4 bg-finvantage-navy/50 p-4 rounded-xl border border-white/5 opacity-80">
                      <div className="bg-white/10 p-2.5 rounded-lg">
                        <Users className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Stage 1</p>
                        <p className="text-sm font-semibold text-gray-200">Academic Sourcing</p>
                      </div>
                    </div>
                    
                    {/* Connector */}
                    <div className="w-0.5 h-6 bg-gradient-to-b from-gray-500/30 to-finvantage-accent/50 ml-9"></div>
                    
                    {/* Node 2: Matrix (Highlighted) */}
                    <div className="flex items-center gap-4 bg-finvantage-accent/10 p-4 rounded-xl border border-finvantage-accent/30 translate-x-4 shadow-lg shadow-finvantage-accent/5">
                      <div className="bg-finvantage-accent p-2.5 rounded-lg shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-finvantage-accent uppercase tracking-widest mb-0.5">Core Engine</p>
                        <p className="text-sm font-bold text-white">The Fitment Matrix Validation</p>
                      </div>
                    </div>
                    
                    {/* Connector */}
                    <div className="w-0.5 h-6 bg-gradient-to-b from-finvantage-accent/50 to-white/50 ml-13 translate-x-4"></div>
                    
                    {/* Node 3: Deployment */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-xl translate-x-8 border border-white">
                      <div className="bg-finvantage-light p-2.5 rounded-lg border border-gray-100">
                        <Briefcase className="w-5 h-5 text-finvantage-navy" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Target Value</p>
                        <p className="text-sm font-bold text-finvantage-navy">Frontline Deployment</p>
                      </div>
                      <div className="text-finvantage-accent">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/4"></div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-finvantage-navy mb-4">A Closed-Loop Ecosystem</h2>
            <p className="text-lg text-finvantage-slate max-w-2xl mx-auto">
              We don't just source candidates; we identify, assess, prepare, and support them to ensure immediate corporate value.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Identify', icon: Target, desc: 'Targeted requirement mapping and sourcing from premier institutions.' },
              { title: 'Assess', icon: ShieldCheck, desc: 'Rigorous screening via the Fitment Matrix for quantitative & behavioural readiness.' },
              { title: 'Prepare', icon: Users, desc: 'Intensive banking-readiness bootcamps to bridge the academic-corporate gap.' },
              { title: 'Support', icon: CheckCircle2, desc: 'Comprehensive interview management and pre-joining support.' }
            ].map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div key={i} className="bg-finvantage-light p-8 rounded-xl border border-gray-100 hover:border-finvantage-accent/30 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-finvantage-navy text-finvantage-accent flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-finvantage-navy mb-3">{prop.title}</h3>
                  <p className="text-sm text-finvantage-slate leading-relaxed">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corporate Ecosystem */}
      <section className="py-24 bg-finvantage-light border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-finvantage-light flex items-center justify-center mb-6 ring-4 ring-white shadow-sm">
                <GitMerge className="w-8 h-8 text-finvantage-accent" />
              </div>
              <h2 className="text-2xl font-bold text-finvantage-navy mb-8">Illustrative Ecosystem Framework</h2>
              <div className="space-y-4">
                {[
                  'Vanguard National Bank',
                  'Horizon Wealth & Retail Bank',
                  'Beacon Housing Finance Corp'
                ].map((bank, i) => (
                  <div key={i} className="flex items-center p-5 bg-finvantage-light rounded-lg border-l-4 border-l-finvantage-navy font-semibold text-finvantage-navy transition-colors hover:bg-gray-100">
                    {bank}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
                * The corporate entities listed above represent an illustrative/hypothetical ecosystem framework as outlined in the FinVantage foundation model.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-finvantage-navy mb-6">Seamless Integration</h2>
            <p className="text-lg text-finvantage-slate mb-8 leading-relaxed">
              By partnering with FinVantage, your institution gains direct access to a curated pipeline of talent that has already demonstrated proficiency in core banking operations, financial compliance, and behavioural resilience.
            </p>
            <ul className="space-y-5">
              {[
                'Reduce time-to-hire and onboarding costs',
                'Ensure regulatory and domain compliance from day one',
                'Lower attrition through better cultural fitment'
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="bg-white rounded-full p-1 shadow-sm mr-4 mt-0.5 shrink-0 text-finvantage-accent">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-finvantage-navy font-medium text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForBanks;
