import { useState, useEffect } from 'react';

export default function CorporateDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [astTitle, setAstTitle] = useState('');

  const [assignJobId, setAssignJobId] = useState('');
  const [assignAstId, setAssignAstId] = useState('');
  
  const [appResults, setAppResults] = useState<Record<string, any>>({});

  const fetchData = async () => {
    try {
      const [jobRes, appRes, astRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications'),
        fetch('/api/assessments')
      ]);
      const jobData = await jobRes.json();
      const appData = await appRes.json();
      const astData = await astRes.json();
      if (jobData.jobs) setJobs(jobData.jobs);
      if (appData.applications) setApps(appData.applications);
      if (astData.assessments) setAssessments(astData.assessments);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateJob = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc })
    });
    if (res.ok) {
      setTitle('');
      setDesc('');
      fetchData();
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    const res = await fetch(`/api/applications/${appId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const handleCreateAst = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: astTitle })
    });
    if (res.ok) {
      setAstTitle('');
      fetchData();
    }
  };

  const handleAddQuestion = async (e: any, astId: string) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const question = formData.get('question');
    const optionsRaw = formData.get('options') as string;
    const correct = formData.get('correct');
    const options = optionsRaw.split(',').map(s => s.trim());
    
    const res = await fetch(`/api/assessments/${astId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        options,
        correctAnswer: correct,
        type: 'MCQ',
        points: 1
      })
    });
    if (res.ok) {
      alert('Question added!');
      e.target.reset();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleAssign = async (e: any) => {
    e.preventDefault();
    if (!assignJobId || !assignAstId) return;
    const res = await fetch(`/api/jobs/${assignJobId}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId: assignAstId })
    });
    if (res.ok) {
      alert('Assigned successfully');
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const loadAppResults = async (appId: string) => {
    const res = await fetch(`/api/applications/${appId}/assessments`);
    if (res.ok) {
      const data = await res.json();
      setAppResults(prev => ({ ...prev, [appId]: data }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-finvantage-navy">Corporate Client Dashboard</h2>
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4">Post a Job</h3>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <input required placeholder="Job Title" className="w-full border p-2 rounded" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea required placeholder="Job Description" className="w-full border p-2 rounded" value={desc} onChange={e=>setDesc(e.target.value)} />
            <button className="bg-finvantage-navy text-white px-4 py-2 rounded">Create Job</button>
          </form>

          <h4 className="font-bold mt-6 mb-2">My Jobs</h4>
          <ul className="space-y-2">
            {jobs.map(j => (
              <li key={j.id} className="border p-2 rounded text-sm flex justify-between items-center">
                <div>
                  <div className="font-bold">{j.title}</div>
                  <div className="text-xs text-gray-500 font-mono">{j.id}</div>
                </div>
                <select className="border rounded p-1 text-xs" value={j.status} onChange={e => handleUpdateJobStatus(j.id, e.target.value)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4">Create Assessment Template</h3>
          <form onSubmit={handleCreateAst} className="space-y-4 mb-6">
            <input required placeholder="Assessment Title" className="w-full border p-2 rounded" value={astTitle} onChange={e=>setAstTitle(e.target.value)} />
            <button className="bg-finvantage-navy text-white px-4 py-2 rounded">Create Assessment</button>
          </form>

          <h4 className="font-bold mt-4 mb-2">My Assessments (Add Questions)</h4>
          <ul className="space-y-4 mb-6">
            {assessments.map(a => (
               <li key={a.id} className="border p-3 rounded bg-gray-50 text-sm">
                 <div className="font-bold mb-2">{a.title} <span className="font-normal text-xs text-gray-500">({a.id})</span></div>
                 <form onSubmit={(e) => handleAddQuestion(e, a.id)} className="space-y-2">
                   <input required name="question" placeholder="Question Text" className="border p-1 text-xs w-full rounded" />
                   <input required name="options" placeholder="Options (comma separated, e.g. A, B, C, D)" className="border p-1 text-xs w-full rounded" />
                   <input required name="correct" placeholder="Exact Correct Option" className="border p-1 text-xs w-full rounded" />
                   <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded font-bold">Add MCQ</button>
                 </form>
               </li>
            ))}
            {assessments.length === 0 && <p className="text-xs text-gray-500">No assessments created yet.</p>}
          </ul>
          
          <h4 className="font-bold mt-4 mb-2">Assign Assessment to Job</h4>
          <form onSubmit={handleAssign} className="space-y-2">
            <select className="w-full border p-2 rounded" value={assignJobId} onChange={e=>setAssignJobId(e.target.value)}>
              <option value="">Select Job...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <select className="w-full border p-2 rounded" value={assignAstId} onChange={e=>setAssignAstId(e.target.value)}>
              <option value="">Select Assessment...</option>
              {assessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <button className="bg-finvantage-accent text-white px-4 py-2 rounded font-bold">Assign</button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-bold text-lg mb-4">Applications & Recruitment Workflow</h3>
        <ul className="space-y-4">
          {apps.map(a => (
            <li key={a.application.id} className="border p-4 rounded bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-sm text-gray-500">{a.application.id}</span>
                  <div className="font-bold text-lg">{a.candidateName} <span className="font-normal text-sm text-gray-600">({a.candidateEmail})</span></div>
                  <div className="text-sm text-gray-600 mb-2">
                    Phone: {a.candidatePhone || 'N/A'} | Resume: {a.candidateResumeUrl ? <a href={a.candidateResumeUrl} className="text-blue-500 hover:underline">Link</a> : 'N/A'}
                  </div>
                  <div className="text-sm">Job ID: {a.application.jobId}</div>
                  <div className="text-sm font-bold text-orange-600">Source: {a.application.submittedByOrganizationId ? 'College' : 'Direct'}</div>
                </div>
                <div className="flex flex-col space-y-2 items-end">
                  <select 
                    className="border rounded p-1 text-sm font-bold bg-white" 
                    value={a.application.status} 
                    onChange={e => handleUpdateAppStatus(a.application.id, e.target.value)}
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="REVIEWING">REVIEWING</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                  <button onClick={() => loadAppResults(a.application.id)} className="border px-3 py-1 text-sm rounded bg-white hover:bg-gray-100 shadow-sm font-bold">
                    Load Assessment Results
                  </button>
                </div>
              </div>
              
              {appResults[a.application.id] && (
                <div className="mt-4 p-4 border rounded bg-white shadow-inner">
                  <h5 className="font-bold text-sm mb-2">Assessment Results:</h5>
                  {appResults[a.application.id].assessments.map((ast: any) => {
                    const results = appResults[a.application.id].results.filter((r: any) => r.assessmentId === ast.id);
                    return (
                      <div key={ast.id} className="text-sm flex justify-between border-b py-2">
                        <span>{ast.title}</span>
                        {results.length > 0 ? (
                          <div className="text-right space-y-1">
                            {results.map((r: any, idx: number) => (
                              <div key={r.id} className="text-green-600 font-bold">Attempt {idx+1}: {r.score}%</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not completed</span>
                        )}
                      </div>
                    );
                  })}
                  {appResults[a.application.id].assessments.length === 0 && <span className="text-sm text-gray-500">No assessments assigned to this job.</span>}
                </div>
              )}
            </li>
          ))}
          {apps.length === 0 && <p className="text-gray-500 text-sm">No applications received yet.</p>}
        </ul>
      </div>
    </div>
  );
}
