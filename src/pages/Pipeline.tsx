import { Map, Users, Target, BookOpen, Calendar, ShieldCheck } from 'lucide-react';

const Pipeline = () => {
  const steps = [
    { num: 1, title: 'Requirement Mapping', icon: Map, desc: 'Aligning corporate needs with specific skill profiles.' },
    { num: 2, title: 'Talent Sourcing', subtitle: '(Colleges/Institutes)', icon: Users, desc: 'Activating the Backward Chain for premier candidate identification.' },
    { num: 3, title: 'Screening', subtitle: '(Quantitative & Behavioural)', icon: Target, isMatrix: true, desc: 'Rigorous evaluation via our proprietary assessment engine.' },
    { num: 4, title: 'Banking-Readiness Bootcamps', icon: BookOpen, desc: 'Targeted preparation bridging academic knowledge and corporate execution.' },
    { num: 5, title: 'Interview Management', icon: Calendar, desc: 'Streamlined scheduling and feedback loops for corporate partners.' },
    { num: 6, title: 'Pre-joining Support', icon: ShieldCheck, desc: 'Ensuring seamless onboarding and immediate corporate value.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-finvantage-light">
      {/* Hero */}
      <section className="bg-finvantage-navy text-white pt-20 pb-12 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Engineering the Talent Pipeline
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            A meticulously designed six-stage workflow that transforms academic potential into frontline banking excellence.
          </p>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="pt-10 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Center Line */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-finvantage-navy via-finvantage-accent to-finvantage-navy/10 rounded"></div>
            
            <div className="space-y-16">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} id={`step-${step.num}`} className={`relative flex flex-col lg:flex-row items-center ${isEven ? 'lg:flex-row-reverse' : ''} group`}>
                    
                    {/* Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-finvantage-navy border-[5px] border-finvantage-light z-10 hidden lg:flex transition-transform group-hover:scale-110 group-hover:bg-finvantage-accent duration-300 shadow-md">
                      <span className="text-white font-bold text-lg">{step.num}</span>
                    </div>

                    {/* Content */}
                    <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pl-16' : 'lg:pr-16'}`}>
                      <div className={`bg-white p-8 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg ${step.isMatrix ? 'border-finvantage-accent ring-1 ring-finvantage-accent/20 relative overflow-hidden' : 'border-gray-100 hover:border-gray-300'}`}>
                        
                        {step.isMatrix && (
                          <div className="absolute top-0 right-0 bg-finvantage-accent text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-lg shadow-sm">
                            Core Engine
                          </div>
                        )}

                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-xl bg-finvantage-light flex items-center justify-center mr-4 lg:hidden">
                            <span className="text-finvantage-navy font-bold text-lg">{step.num}</span>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-finvantage-navy/5 flex items-center justify-center">
                            <Icon className={`w-6 h-6 ${step.isMatrix ? 'text-finvantage-accent' : 'text-finvantage-navy'}`} />
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-finvantage-navy mb-1">{step.title}</h3>
                        {step.subtitle && <p className="text-finvantage-accent font-bold text-xs uppercase tracking-wider mb-3">{step.subtitle}</p>}
                        <p className="text-finvantage-slate text-base leading-relaxed mb-6">{step.desc}</p>
                        
                        {step.isMatrix && (
                          <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-center font-bold text-finvantage-navy mb-6 bg-finvantage-light py-2 rounded-lg text-sm">The FinVantage Fitment Matrix</h4>
                            <div className="space-y-3">
                              {[
                                { phase: 'Phase 1', title: 'Quantitative Skill & Analytical Core Reasoning' },
                                { phase: 'Phase 2', title: 'Core Banking Operations & Financial Compliance' },
                                { phase: 'Phase 3', title: 'Behavioural Competency & Mock Stress Interviews' }
                              ].map((phase, pIdx) => (
                                <div key={pIdx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-[4px] border-l-finvantage-accent hover:bg-finvantage-light transition-colors group/matrix">
                                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover/matrix:text-finvantage-accent transition-colors">{phase.phase}</span>
                                  <span className="text-sm font-semibold text-finvantage-navy">{phase.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pipeline;
