import { useState, useEffect } from 'react';

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  const [resumeUrl, setResumeUrl] = useState('');
  const [phone, setPhone] = useState('');

  // Test Taking State
  const [activeTest, setActiveTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testLoading, setTestLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [jobRes, appRes, astRes, profRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications'),
        fetch('/api/candidate/assessments'),
        fetch('/api/candidates/profile')
      ]);

      if (jobRes.status === 403 || appRes.status === 403 || astRes.status === 403 || profRes.status === 403) {
        setNeedsOnboarding(true);
        return;
      }

      const jobData = await jobRes.json();
      const appData = await appRes.json();
      const astData = await astRes.json();
      const profData = await profRes.json();
      
      if (jobData.jobs) setJobs(jobData.jobs);
      if (appData.applications) setApps(appData.applications);
      if (astData.assessments) setAssessments(astData.assessments);
      if (astData.results) setResults(astData.results);
      
      if (profData.profile) {
        setResumeUrl(profData.profile.resumeUrl || '');
        setPhone(profData.profile.phone || '');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOnboard = async () => {
    const res = await fetch('/api/candidates/profile', { method: 'POST' });
    if (res.ok) {
      setNeedsOnboarding(false);
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to onboard');
    }
  };

  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/candidates/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeUrl, phone })
    });
    if (res.ok) {
      alert('Profile updated');
      fetchData();
    } else {
      alert('Failed to update profile');
    }
  };

  const applyToJob = async (jobId: string) => {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const startAssessment = async (ast: any) => {
    setTestLoading(true);
    const res = await fetch(`/api/assessments/${ast.assessment.id}/questions`);
    const data = await res.json();
    setTestLoading(false);

    if (res.ok) {
      setActiveTest(ast);
      setQuestions(data.questions);
      setCurrentQ(0);
      setAnswers({});
    } else {
      alert(data.error);
    }
  };

  const handleOptionSelect = (qId: string, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const submitAssessment = async () => {
    if (!activeTest) return;
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Are you sure you want to submit?')) return;
    } else {
      if (!confirm('Are you sure you want to submit your assessment?')) return;
    }
    setTestLoading(true);
    const res = await fetch(`/api/assessments/${activeTest.assessment.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        applicationId: activeTest.applicationId,
        answers 
      })
    });
    setTestLoading(false);
    
    if (res.ok) {
      const data = await res.json();
      alert(`Assessment submitted! Score: ${data.result.score}%`);
      setActiveTest(null);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  if (needsOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 mt-12 bg-white p-10 rounded shadow max-w-md mx-auto text-center border">
        <h2 className="text-2xl font-bold text-finvantage-navy">Welcome to FinVantage!</h2>
        <p className="text-gray-600">Join as a Candidate to browse and apply for jobs.</p>
        <button onClick={handleOnboard} className="bg-finvantage-accent text-white px-6 py-3 rounded font-bold hover:bg-orange-600 w-full">Join as a Candidate</button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    );
  }

  // Active Test UI
  if (activeTest) {
    const q = questions[currentQ];
    const progress = Math.round(((currentQ) / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-finvantage-navy">{activeTest.assessment.title}</h2>
          <button onClick={() => setActiveTest(null)} className="text-sm text-red-500 font-bold hover:underline">Cancel</button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No questions available for this assessment yet.</p>
            <button onClick={() => setActiveTest(null)} className="mt-4 bg-finvantage-navy text-white px-4 py-2 rounded">Go Back</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-gray-500 mb-1 font-bold">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div className="bg-finvantage-accent h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="text-lg font-medium text-gray-900 mb-4">{q.question}</div>
            
            <div className="space-y-3">
              {q.options && q.options.map((opt: string, idx: number) => (
                <label 
                  key={idx} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[q.id] === opt ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={q.id} 
                    value={opt} 
                    checked={answers[q.id] === opt} 
                    onChange={() => handleOptionSelect(q.id, opt)}
                    className="w-4 h-4 text-finvantage-accent bg-gray-100 border-gray-300 focus:ring-finvantage-accent"
                  />
                  <span className="ml-3 text-gray-700">{opt}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button 
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(prev => prev - 1)}
                className="px-6 py-2 border rounded font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              
              {currentQ === questions.length - 1 ? (
                  <div className="relative flex flex-col items-end">
                    <button 
                      onClick={submitAssessment}
                      disabled={testLoading}
                      className="px-6 py-2 bg-finvantage-accent text-white rounded font-bold hover:bg-orange-600 shadow disabled:opacity-50"
                    >
                      {testLoading ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                    {Object.keys(answers).length < questions.length && (
                      <div className="absolute mt-12 right-0 text-red-500 text-sm font-bold whitespace-nowrap">
                        You have unanswered questions!
                      </div>
                    )}
                  </div>
                ) : (
                <button 
                  onClick={() => setCurrentQ(prev => prev + 1)}
                  className="px-6 py-2 bg-finvantage-navy text-white rounded font-bold hover:bg-gray-800 shadow"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-finvantage-navy">Candidate Dashboard</h2>
      {error && <div className="text-red-500">{error}</div>}
      {testLoading && <div className="text-blue-500 font-bold">Loading...</div>}
      
      <div className="bg-white p-6 rounded shadow border">
        <h3 className="font-bold text-lg mb-4">My Profile</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Resume URL</label>
            <input className="w-full border p-2 rounded" value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Phone</label>
            <input className="w-full border p-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 555-555-5555" />
          </div>
          <button className="bg-finvantage-navy text-white px-4 py-2 rounded">Update Profile</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="font-bold text-lg mb-4">Open Jobs</h3>
          <ul className="space-y-4">
            {jobs.map(j => {
              const hasApplied = apps.some(a => a.application.jobId === j.id);
              return (
                <li key={j.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                  <div>
                    <div className="font-bold text-lg">{j.title}</div>
                    <div className="text-sm text-gray-600">{j.description}</div>
                  </div>
                  <button 
                    disabled={hasApplied}
                    onClick={() => applyToJob(j.id)}
                    className={`px-4 py-2 rounded font-bold ${hasApplied ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-finvantage-accent text-white hover:bg-orange-600'}`}
                  >
                    {hasApplied ? 'Applied' : 'Apply'}
                  </button>
                </li>
              );
            })}
            {jobs.length === 0 && <p className="text-gray-500 text-sm">No open jobs found.</p>}
          </ul>
        </div>

        <div className="bg-white p-6 rounded shadow border">
          <h3 className="font-bold text-lg mb-4">Required Assessments</h3>
          <ul className="space-y-4">
            {assessments.map((a, idx) => {
              const hist = results.filter(r => r.assessmentId === a.assessment.id && r.applicationId === a.applicationId);
              return (
                <li key={idx} className="border p-4 rounded bg-gray-50">
                  <div className="font-bold text-finvantage-navy">{a.assessment.title}</div>
                  <div className="text-xs text-gray-500 mb-2 font-mono">App: {a.applicationId}</div>
                  {hist.length > 0 ? (
                    <div className="mb-3 space-y-1">
                      {hist.map((h, i) => (
                        <div key={i} className="text-sm text-green-600 font-bold">Attempt {i+1}: {h.score}%</div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 text-sm text-yellow-600 font-bold">Status: Pending</div>
                  )}
                  <button 
                    onClick={() => startAssessment(a)}
                    className="bg-blue-600 text-white px-4 py-2 text-sm rounded font-bold shadow hover:bg-blue-700 transition-colors w-full"
                  >
                    {hist.length > 0 ? 'Retake Assessment' : 'Start Assessment'}
                  </button>
                </li>
              );
            })}
            {assessments.length === 0 && <p className="text-gray-500 text-sm">No pending assessments.</p>}
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow border">
        <h3 className="font-bold text-lg mb-4">My Applications</h3>
        <ul className="space-y-2">
          {apps.map(a => (
            <li key={a.application.id} className="border p-4 rounded text-sm bg-gray-50 flex justify-between">
              <div>
                <div className="font-bold">{a.jobTitle}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">ID: {a.application.id}</div>
              </div>
              <div className="font-bold text-finvantage-navy px-3 py-1 bg-blue-100 rounded self-center">{a.application.status}</div>
            </li>
          ))}
          {apps.length === 0 && <p className="text-gray-500 text-sm">No applications yet.</p>}
        </ul>
      </div>
    </div>
  );
}
