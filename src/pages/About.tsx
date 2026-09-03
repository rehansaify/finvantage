import { Award, BookOpen, Scale, Briefcase } from 'lucide-react';

const About = () => {
  const partners = [
    {
      role: "Partner A",
      title: "Director – Academic Relations & Strategy",
      credentials: "Ph.D. in Management, MBA (HR)",
      experience: "18+ years experience",
      detail: "Academic Leadership & Institutional Strategy",
      icon: BookOpen
    },
    {
      role: "Partner B",
      title: "Partner – Banking Domain & Financial Assessment",
      credentials: "Chartered Accountant (ICAI)",
      experience: "15 years experience",
      detail: "Corporate Banking & Risk Audits",
      icon: Award
    },
    {
      role: "Partner C",
      title: "Partner – Corporate Governance & Compliance",
      credentials: "Chartered Accountant (ICAI)",
      experience: "16 years experience",
      detail: "Enterprise Tax & Legal Architecture",
      icon: Scale
    },
    {
      role: "Partner D",
      title: "Partner – Client Relations & Business Operations",
      credentials: "MBA (Banking & Finance)",
      experience: "14 years experience",
      detail: "Retail & Corporate Branch Banking",
      icon: Briefcase
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-finvantage-light">
      {/* Hero */}
      <section className="bg-finvantage-navy text-white pt-24 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            The Architectural Foundation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            FinVantage is built on a cornerstone of deep industry expertise. Our leadership brings decades of combined experience across academia, corporate finance, risk auditing, and banking operations.
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+PC9zdmc+')] opacity-50"></div>
      </section>

      {/* Partners Grid */}
      <section className="-mt-16 pb-24 relative z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partners.map((partner, index) => {
              const Icon = partner.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full transform transition-transform hover:-translate-y-1 duration-300 group">
                  <div className="bg-finvantage-light p-8 flex justify-center border-b border-gray-100 relative">
                    {/* Elegant abstract icon holder instead of a broken silhouette */}
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-finvantage-accent/20 flex items-center justify-center relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-finvantage-navy" />
                    </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <h2 className="text-2xl font-extrabold text-finvantage-navy mb-2">{partner.role}</h2>
                    <h3 className="text-sm font-bold text-finvantage-accent mb-6 h-12 leading-snug uppercase tracking-wide">{partner.title}</h3>
                    
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Credentials</p>
                      <p className="text-sm text-finvantage-navy font-bold leading-relaxed">{partner.credentials}</p>
                    </div>
                    
                    <div className="mt-auto bg-finvantage-light p-5 rounded-xl border border-gray-100">
                      <p className="font-bold text-finvantage-navy text-sm mb-2">{partner.experience}</p>
                      <p className="text-xs text-finvantage-slate font-medium flex items-start gap-2 leading-relaxed">
                        <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-finvantage-accent" />
                        {partner.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
