import { useState, useEffect } from 'react';

export default function SourcingDashboard() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const [lookupEmail, setLookupEmail] = useState('');
  const [foundCandidate, setFoundCandidate] = useState<any>(null);

  const [submitCandidateId, setSubmitCandidateId] = useState('');
  const [submitJobId, setSubmitJobId] = useState('');

  const fetchData = async () => {
    try {
      const [candRes, appRes] = await Promise.all([
        fetch('/api/college/candidates'),
        fetch('/api/applications')
      ]);
      const candData = await candRes.json();
      const appData = await appRes.json();
      
      if (candData.candidates) setCandidates(candData.candidates);
      if (appData.applications) setApps(appData.applications.map((a: any) => a.application));
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLookup = async (e: any) => {
    e.preventDefault();
    setError('');
    setFoundCandidate(null);
    const res = await fetch(`/api/college/lookup-candidate?email=${encodeURIComponent(lookupEmail)}`);
    const data = await res.json();
    if (res.ok) {
      setFoundCandidate(data.candidate);
    } else {
      setError(data.error);
    }
  };

  const handleSourceCandidate = async () => {
    if (!foundCandidate) return;
    const res = await fetch('/api/candidates/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: foundCandidate.id })
    });
    if (res.ok) {
      alert('Candidate sourced successfully!');
      setFoundCandidate(null);
      setLookupEmail('');
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleSubmitCandidate = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: submitCandidateId, jobId: submitJobId })
    });
    if (res.ok) {
      alert('Candidate submitted to job successfully!');
      setSubmitCandidateId('');
      setSubmitJobId('');
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-finvantage-navy">Sourcing Partner Dashboard</h2>
      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="font-bold text-lg mb-4">Source a Candidate</h3>
          <form onSubmit={handleLookup} className="flex space-x-2 mb-4">
            <input 
              type="email" required placeholder="Candidate Email" 
              className="flex-1 border p-2 rounded" 
              value={lookupEmail} onChange={e=>setLookupEmail(e.target.value)} 
            />
            <button className="bg-gray-800 text-white px-4 py-2 rounded">Lookup</button>
          </form>

          {foundCandidate && (
            <div className="p-4 border border-green-500 rounded bg-green-50 mb-4">
              <div className="font-bold text-lg">{foundCandidate.name}</div>
              <div className="text-sm text-gray-600">{foundCandidate.email}</div>
              <div className="text-xs text-gray-500 font-mono my-2">ID: {foundCandidate.id}</div>
              <button onClick={handleSourceCandidate} className="bg-finvantage-accent text-white px-4 py-2 rounded font-bold w-full hover:bg-orange-600">
                Add to Sourced Candidates
              </button>
            </div>
          )}

          <h4 className="font-bold mt-6 mb-2">My Sourced Candidates</h4>
          <ul className="space-y-2">
            {candidates.map(c => (
              <li key={c.id} className="border p-3 rounded text-sm bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-gray-600">{c.email}</div>
                </div>
                <div className="text-xs text-gray-400 font-mono">ID: {c.id.substring(0,8)}...</div>
              </li>
            ))}
            {candidates.length === 0 && <p className="text-gray-500 text-sm">No sourced candidates yet.</p>}
          </ul>
        </div>

        <div className="bg-white p-6 rounded shadow border">
          <h3 className="font-bold text-lg mb-4">Submit Candidate to Bank Job</h3>
          <form onSubmit={handleSubmitCandidate} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700">Candidate</label>
              <select required className="w-full border p-2 rounded" value={submitCandidateId} onChange={e=>setSubmitCandidateId(e.target.value)}>
                <option value="">Select a sourced candidate...</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Job ID</label>
              <input required placeholder="job-..." className="w-full border p-2 rounded font-mono" value={submitJobId} onChange={e=>setSubmitJobId(e.target.value)} />
            </div>
            <button className="bg-finvantage-navy text-white px-4 py-2 rounded w-full font-bold">Submit Application</button>
          </form>

          <h4 className="font-bold mt-4 mb-2">Submitted Applications</h4>
          <ul className="space-y-2">
            {apps.map(a => (
              <li key={a.id} className="border p-3 rounded text-sm flex justify-between bg-gray-50">
                <div>
                  <div className="font-mono text-xs text-gray-500">App ID: {a.id}</div>
                  <div>Job ID: {a.jobId}</div>
                </div>
                <div className="font-bold text-finvantage-navy">{a.status}</div>
              </li>
            ))}
            {apps.length === 0 && <p className="text-gray-500 text-sm">No applications submitted yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
