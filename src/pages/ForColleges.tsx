import { GraduationCap, ArrowUpRight, BookOpen, LineChart, Building2, CheckCircle2, Award, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForColleges = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="bg-finvantage-navy text-white pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-finvantage-accent text-sm font-semibold mb-6 tracking-wide uppercase">
                Backward Chain
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
                For Colleges & Universities
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Elevate your campus placement metrics by providing students with direct, premier BFSI career pathways.
              </p>
              <Link to="/contact" className="bg-white hover:bg-gray-100 text-finvantage-navy px-8 py-3.5 rounded-lg font-semibold text-base transition-colors inline-flex items-center gap-2 group shadow-sm">
                Become a Sourcing Partner <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
            
            {/* Right Visual Rep (Premium, Abstract Academic Pathway) */}
            <div className="hidden lg:block relative h-full">
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full max-w-[420px]">
                 <div className="relative border-l-2 border-white/10 ml-8 space-y-8 py-6">
                    
                    {/* Node 1: Academic Cohort */}
                    <div className="relative group/node cursor-default">
                       <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-finvantage-navy border-[4px] border-gray-500 z-10 transition-colors group-hover/node:border-gray-400"></div>
                       <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-lg transition-colors group-hover/node:bg-white/10">
                         <div className="flex items-center gap-3">
                           <div className="bg-white/10 p-2 rounded-lg">
                             <GraduationCap className="w-5 h-5 text-gray-300" />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-white tracking-wide">Academic Cohort</h4>
                             <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Foundational Education</p>
                           </div>
                         </div>
                       </div>
                    </div>
                    
                    {/* Node 2: Bootcamp & Matrix */}
                    <div className="relative group/node cursor-default">
                       <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-finvantage-accent border-[4px] border-finvantage-navy shadow-[0_0_0_2px_rgba(16,185,129,0.3)] z-10"></div>
                       <div className="bg-finvantage-accent/10 border border-finvantage-accent/30 rounded-xl p-5 backdrop-blur-md shadow-lg shadow-finvantage-accent/5">
                         <div className="flex items-center gap-3">
                           <div className="bg-finvantage-accent p-2 rounded-lg shadow-sm">
                             <Award className="w-5 h-5 text-white" />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-finvantage-accent tracking-wide">Readiness Bootcamps</h4>
                             <p className="text-[11px] text-gray-300 mt-0.5 uppercase tracking-wider font-semibold">Bridging the theoretical gap</p>
                           </div>
                         </div>
                       </div>
                    </div>
                    
                    {/* Node 3: Corporate Roles */}
                    <div className="relative group/node cursor-default">
                       <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-[4px] border-finvantage-navy z-10"></div>
                       <div className="bg-white rounded-xl p-5 shadow-xl border border-gray-100">
                         <div className="flex items-center gap-3">
                           <div className="bg-finvantage-light p-2 rounded-lg border border-gray-100">
                             <Building2 className="w-5 h-5 text-finvantage-navy" />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-finvantage-navy tracking-wide">Premier Career Pathways</h4>
                             <p className="text-[11px] text-finvantage-slate mt-0.5 uppercase tracking-wider font-bold">Top-Tier BFSI Roles</p>
                           </div>
                         </div>
                       </div>
                    </div>
                    
                 </div>
              </div>
            </div>
            
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-finvantage-accent/10 blur-[100px] pointer-events-none transform translate-x-1/4 translate-y-1/4"></div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-finvantage-navy mb-4">Empowering Academic Institutions</h2>
            <p className="text-lg text-finvantage-slate max-w-2xl mx-auto">
              We bridge the gap between academic theory and frontline corporate execution, ensuring your students are banking-ready.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Industry-Aligned Preparation', icon: BookOpen, desc: 'Access to banking-readiness bootcamps that prepare students for rigorous corporate environments.' },
              { title: 'Premier Career Pathways', icon: Building2, desc: 'Direct connections to top-tier Banks and NBFCs through our closed-loop ecosystem.' },
              { title: 'Placement Metrics', icon: LineChart, desc: 'Elevate your institutional standing with higher placement rates in specialized financial roles.' }
            ].map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div key={i} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow hover:border-finvantage-accent/30">
                  <div className="w-12 h-12 rounded-lg bg-finvantage-light text-finvantage-accent flex items-center justify-center mb-6">
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

      {/* Academic Ecosystem */}
      <section className="py-24 bg-finvantage-light border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2">
            <div className="bg-finvantage-navy p-10 rounded-2xl shadow-xl text-white">
              <div className="w-16 h-16 rounded-full bg-finvantage-navy border border-white/20 flex items-center justify-center mb-6 shadow-inner">
                <Network className="w-8 h-8 text-finvantage-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-8">Illustrative Ecosystem Framework</h2>
              <div className="space-y-4">
                {[
                  'Apex Institute of Management',
                  'Metro Premier Degree College',
                  'Zenith University'
                ].map((college, i) => (
                  <div key={i} className="flex items-center p-5 bg-white/5 rounded-lg border-l-4 border-l-finvantage-accent font-semibold transition-colors hover:bg-white/10">
                    {college}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-white/10 leading-relaxed">
                * The institutions listed above represent an illustrative/hypothetical ecosystem framework as outlined in the FinVantage foundation model.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-finvantage-navy mb-6">Develop Talent. Enable Careers.</h2>
            <p className="text-lg text-finvantage-slate mb-8 leading-relaxed">
              Our comprehensive talent pipeline takes the guesswork out of student placements. From requirement mapping to quantitative and behavioural screening, we ensure your candidates are positioned for success.
            </p>
            <ul className="space-y-5">
              {[
                'Feedback via the FinVantage Fitment Matrix',
                'Pre-joining support and interview management',
                'Transparent assessment reporting'
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

export default ForColleges;
