import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useSession, authClient } from '../../lib/auth-client';
import { LayoutDashboard, Users, Briefcase, Settings, LogOut, ChevronDown } from 'lucide-react';

import { useState, useEffect } from 'react';

export default function AppLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-finvantage-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finvantage-navy mb-4"></div>
        <p className="font-bold text-finvantage-navy">Loading Application Context...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayoutContent />;
}

function AppLayoutContent() {
  const { data: activeOrg, isPending: orgPending } = authClient.useActiveOrganization();
  const { data: orgs } = authClient.useListOrganizations();
  const location = useLocation();

  const [extendedOrg, setExtendedOrg] = useState<any>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (activeOrg?.id) {
      setFetchError(false);
      fetch(`/api/organizations/${activeOrg.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.organization) {
            setExtendedOrg(data.organization);
          } else {
            setFetchError(true);
          }
        })
        .catch(() => setFetchError(true));
    } else {
      setExtendedOrg(null);
      setFetchError(false);
    }
  }, [activeOrg?.id]);

  if (orgPending || (activeOrg && !extendedOrg && !fetchError)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-finvantage-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finvantage-navy mb-4"></div>
        <p className="font-bold text-finvantage-navy">Loading Organization Context...</p>
      </div>
    );
  }

  const currentPath = location.pathname;
  let targetRoute = '/app/candidate';
  const orgType = extendedOrg ? extendedOrg.type : null;
  
  if (activeOrg) {
    switch (orgType) {
      case 'BANK': targetRoute = '/app/corporate'; break;
      case 'COLLEGE': targetRoute = '/app/sourcing'; break;
      case 'FINVANTAGE': targetRoute = '/app/admin'; break;
      default: targetRoute = '/app/unauthorized';
    }
  }

  if (currentPath === '/app') {
    return <Navigate to={targetRoute} replace />;
  }

  // Strictly enforce context boundaries for direct URL navigation
  const isCorporateRoute = currentPath.startsWith('/app/corporate');
  const isSourcingRoute = currentPath.startsWith('/app/sourcing');
  const isAdminRoute = currentPath.startsWith('/app/admin');
  const isCandidateRoute = currentPath.startsWith('/app/candidate');

  if (isCorporateRoute && orgType !== 'BANK') return <Navigate to="/app/unauthorized" replace />;
  if (isSourcingRoute && orgType !== 'COLLEGE') return <Navigate to="/app/unauthorized" replace />;
  if (isAdminRoute && orgType !== 'FINVANTAGE') return <Navigate to="/app/unauthorized" replace />;
  if (isCandidateRoute && orgType !== null) return <Navigate to="/app/unauthorized" replace />;

  // Define navigation links based on context
  const navLinks = [];
  if (!activeOrg) {
    navLinks.push({ name: 'Candidate Profile', path: '/app/candidate', icon: <LayoutDashboard size={20} /> });
  } else if (orgType === 'BANK') {
    navLinks.push({ name: 'Corporate Dashboard', path: '/app/corporate', icon: <LayoutDashboard size={20} /> });
    navLinks.push({ name: 'Job Requirements', path: '#', icon: <Briefcase size={20} /> });
  } else if (orgType === 'COLLEGE') {
    navLinks.push({ name: 'Sourcing Dashboard', path: '/app/sourcing', icon: <LayoutDashboard size={20} /> });
    navLinks.push({ name: 'Students', path: '#', icon: <Users size={20} /> });
  } else if (orgType === 'FINVANTAGE') {
    navLinks.push({ name: 'Admin Dashboard', path: '/app/admin', icon: <LayoutDashboard size={20} /> });
  }
  
  navLinks.push({ name: 'Organization Settings', path: '/app/settings', icon: <Settings size={20} /> });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-finvantage-navy text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-700">
          <Link to="/app" className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-finvantage-accent rounded flex items-center justify-center font-bold text-finvantage-navy">
              F
            </div>
            FinVantage
          </Link>
        </div>
        
        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Navigation</p>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-finvantage-accent text-finvantage-navy font-semibold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-finvantage-navy bg-finvantage-light px-3 py-1 rounded-full border border-gray-200">
              {activeOrg ? `Context: ${activeOrg.name}` : "Context: Personal / Candidate"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <select 
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-finvantage-accent focus:border-transparent cursor-pointer"
                value={activeOrg?.id || "candidate"}
                onChange={async (e) => {
                  const val = e.target.value;
                  if (val === "candidate") {
                    await authClient.organization.setActive({ organizationId: null });
                  } else {
                    await authClient.organization.setActive({ organizationId: val });
                  }
                  window.location.href = '/app';
                }}
              >
                <option value="candidate">Candidate Context</option>
                {orgs?.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button 
              onClick={async () => {
                await authClient.signOut();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
