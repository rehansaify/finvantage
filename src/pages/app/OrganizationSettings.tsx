import { useState, useEffect } from 'react';
import { authClient } from '../../lib/auth-client';

export default function OrganizationSettings() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  const [createMode, setCreateMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', type: 'BANK' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [extendedOrg, setExtendedOrg] = useState<any>(null);

  // Fetch members and extended org details when activeOrg changes
  useEffect(() => {
    if (activeOrg) {
      setMembersLoading(true);
      Promise.all([
        fetch(`/api/organizations/${activeOrg.id}/members`).then(res => res.json()),
        fetch(`/api/organizations/${activeOrg.id}`).then(res => res.json())
      ])
      .then(([membersData, orgData]) => {
        if (membersData.members) setMembers(membersData.members);
        if (orgData.organization) setExtendedOrg(orgData.organization);
      })
      .catch(console.error)
      .finally(() => setMembersLoading(false));
    } else {
      setMembers([]);
      setExtendedOrg(null);
    }
  }, [activeOrg?.id]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to create organization');
      }
      setSuccess('Organization created successfully!');
      setCreateMode(false);
      
      // Automatically set the new organization as active
      if (result.organization?.id) {
        await authClient.organization.setActive({ organizationId: result.organization.id });
      }
      
      window.location.href = '/app/settings';
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-finvantage-navy">Organization Settings</h2>
        <button 
          onClick={() => setCreateMode(!createMode)}
          className="bg-finvantage-accent text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-emerald-600 font-semibold transition-colors flex items-center gap-2"
        >
          {createMode ? 'Cancel' : '+ Create Organization'}
        </button>
      </div>

      {createMode && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-finvantage-navy">Create New Organization</h3>
            <p className="text-sm text-gray-500 mt-1">Configure your organization details and workspace context.</p>
          </div>
          
          {error && <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
          {success && <div className="mb-6 text-green-600 bg-green-50 p-4 rounded-xl text-sm font-medium border border-green-100">{success}</div>}
          
          <form onSubmit={handleCreateOrg} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-finvantage-navy mb-1.5">Organization Name</label>
              <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Global Banking Corp" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-finvantage-navy mb-1.5">Organization Slug</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm">finvantage.com/</span>
                <input type="text" required pattern="[a-z0-9-]+" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="global-banking-corp" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Lowercase letters, numbers, and hyphens only.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-finvantage-navy mb-1.5">Organization Type</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="BANK">Bank / NBFC (Corporate Client)</option>
                <option value="COLLEGE">College / University (Sourcing Partner)</option>
                <option value="FINVANTAGE">FinVantage (System Admin)</option>
              </select>
            </div>
            <div className="pt-2">
              <button type="submit" className="bg-finvantage-navy text-white px-6 py-3 rounded-xl hover:bg-gray-800 w-full md:w-auto font-bold shadow-md transition-colors">
                Create Organization
              </button>
            </div>
          </form>
        </div>
      )}

      {!createMode && activeOrg && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Organization Profile</h3>
            <div className="space-y-3">
              <p className="flex items-center"><span className="font-semibold w-24">Name:</span> <span>{activeOrg.name}</span></p>
              <p className="flex items-center"><span className="font-semibold w-24">Slug:</span> <span>{activeOrg.slug}</span></p>
              <p className="flex items-center">
                <span className="font-semibold w-24">Type:</span> 
                {extendedOrg ? (
                  <span className="text-xs font-bold uppercase bg-finvantage-navy text-white px-2 py-1 rounded">
                    {extendedOrg.type}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Loading...</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Members</h3>
            <div className="space-y-4">
              {membersLoading ? (
                <p className="text-gray-500 text-sm">Loading members...</p>
              ) : members.length === 0 ? (
                <p className="text-gray-500 text-sm">No members found.</p>
              ) : (
                members.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                    <div>
                      <p className="font-bold text-sm">{m.user?.name}</p>
                      <p className="text-xs text-gray-500">{m.user?.email}</p>
                    </div>
                    <span className="text-xs font-bold uppercase bg-finvantage-navy text-white px-2 py-1 rounded">
                      {m.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!createMode && !activeOrg && (
        <div className="bg-white p-6 rounded shadow text-center text-gray-500">
          <p>You are currently in the Personal/Candidate context.</p>
          <p>Select an organization from the header or create a new one.</p>
        </div>
      )}
    </div>
  );
}
