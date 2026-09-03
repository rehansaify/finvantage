import { MapPin, Phone, Globe, Info } from 'lucide-react';

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-finvantage-light">
      {/* Hero */}
      <section className="bg-finvantage-navy text-white pt-24 pb-32 text-center relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Ready to optimise your talent pipeline or elevate your campus placements? Partner with FinVantage today.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="-mt-16 pb-24 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Contact Details (From PDF) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-finvantage-navy mb-10">Corporate Information</h2>
                
                <div className="space-y-10 flex-grow">
                  <div className="flex items-start">
                    <div className="bg-finvantage-light p-3.5 rounded-xl mr-5 text-finvantage-accent shrink-0 border border-gray-100">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-finvantage-navy text-xs uppercase tracking-widest mb-2.5">Corporate Office</h3>
                      <p className="text-finvantage-slate leading-relaxed font-medium">
                        FinVantage HR Advisory LLP<br />
                        401–404, Corporate Financial Tower,<br />
                        Connaught Place, New Delhi – 110001
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-finvantage-light p-3.5 rounded-xl mr-5 text-finvantage-accent shrink-0 border border-gray-100">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-finvantage-navy text-xs uppercase tracking-widest mb-4">Phone Lines</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Sourcing Hotlines</p>
                          <p className="text-finvantage-slate font-semibold text-lg">+91-98765-XXXXX</p>
                          <p className="text-finvantage-slate font-semibold text-lg">+91-98765-YYYYY</p>
                        </div>
                        <div className="pt-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Corporate EPABX</p>
                          <p className="text-finvantage-slate font-semibold text-lg">+91-11-4567XXXX</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-finvantage-light p-3.5 rounded-xl mr-5 text-finvantage-accent shrink-0 border border-gray-100">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-finvantage-navy text-xs uppercase tracking-widest mb-2.5">Digital</h3>
                      <a href="https://www.finvantagehr.com" className="text-finvantage-accent hover:text-emerald-700 font-bold transition-colors text-lg">
                        www.finvantagehr.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form (Placeholder) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 h-full relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h2 className="text-2xl font-bold text-finvantage-navy">Send an Inquiry</h2>
                  <div className="flex items-center text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 mr-1.5" />
                    Demo Form Placeholder
                  </div>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-finvantage-navy mb-2">Full Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow opacity-60 cursor-not-allowed" placeholder="John Doe" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-finvantage-navy mb-2">Corporate / Academic Email</label>
                      <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow opacity-60 cursor-not-allowed" placeholder="john@institution.edu" disabled />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-finvantage-navy mb-2">Institution Type</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow text-gray-500 opacity-60 cursor-not-allowed" disabled>
                      <option>Bank or NBFC (Corporate Client)</option>
                      <option>College or University (Sourcing Partner)</option>
                      <option>Candidate / Student</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-finvantage-navy mb-2">Message</label>
                    <textarea rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow resize-none opacity-60 cursor-not-allowed" placeholder="How can we assist you?" disabled></textarea>
                  </div>
                  
                  <button type="button" className="w-full bg-finvantage-navy text-white font-bold py-4 rounded-xl transition-colors shadow-md opacity-50 cursor-not-allowed mt-4">
                    Submit Inquiry
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
