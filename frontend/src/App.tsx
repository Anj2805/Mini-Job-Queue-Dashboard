import { useEffect, useState, useMemo } from 'react';
import { fetchJobs, createJob, updateJobStatus, deleteJob, type Job } from './api';
import { JobForm } from './components/JobForm';
import { JobTable } from './components/JobTable';

const DEMO_JOBS: Job[] = [
  { id: 'demo-1', title: 'User Data Export', type: 'Export', status: 'pending', createdAt: new Date(Date.now() - 10000).toISOString() },
  { id: 'demo-2', title: 'Send Email Notifications', type: 'Notification', status: 'completed', createdAt: new Date(Date.now() - 50000).toISOString() },
  { id: 'demo-3', title: 'Generate Sales Report', type: 'Report', status: 'running', createdAt: new Date(Date.now() - 15000).toISOString() },
  { id: 'demo-4', title: 'Backup Database', type: 'Backup', status: 'failed', createdAt: new Date(Date.now() - 80000).toISOString() },
  { id: 'demo-5', title: 'Sync User Data', type: 'Sync', status: 'completed', createdAt: new Date(Date.now() - 120000).toISOString() },
  { id: 'demo-6', title: 'Process Payments', type: 'Payment', status: 'pending', createdAt: new Date(Date.now() - 2000).toISOString() },
  { id: 'demo-7', title: 'Clean Old Logs', type: 'Maintenance', status: 'completed', createdAt: new Date(Date.now() - 300000).toISOString() }
];

function App() {
  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [apiConnected, setApiConnected] = useState(false);

  const loadJobs = async () => {
    try {
      const data = await fetchJobs();
      setRealJobs(data);
      setApiConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreate = async (title: string, type: string) => {
    try {
      setActionInProgress(true);
      const newJob = await createJob(title, type);
      setRealJobs([newJob, ...realJobs]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setActionInProgress(true);
      await updateJobStatus(id, status);
      await loadJobs(); // Refresh to ensure exact backend state is reflected
    } catch (err: any) {
      setError(err.message);
      await loadJobs(); // If a conflict (409) occurred, fetch the latest state
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionInProgress(true);
      await deleteJob(id);
      setRealJobs(realJobs.filter(j => j.id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      await loadJobs();
    } finally {
      setActionInProgress(false);
    }
  };

  // If we successfully connected to the API but the database is empty, display the demo dataset.
  const jobsToDisplay = (apiConnected && realJobs.length === 0) ? DEMO_JOBS : realJobs;

  const counts = useMemo(() => {
    const c = { pending: 0, running: 0, completed: 0, failed: 0, total: jobsToDisplay.length };
    jobsToDisplay.forEach(j => { if (c[j.status] !== undefined) c[j.status]++; });
    return c;
  }, [jobsToDisplay]);

  const filteredJobs = useMemo(() => {
    return filter === 'all' ? jobsToDisplay : jobsToDisplay.filter(j => j.status === filter);
  }, [jobsToDisplay, filter]);

  return (
    <div className="dashboard-container">
      <header className="top-header">
        <div className="app-logo">
          <span className="app-logo-icon">⚡</span>
          JobQueue
        </div>
        {apiConnected && (
          <div className="api-status">
            API Connected
          </div>
        )}
      </header>

      <div className="dashboard-header">
        <h1 className="dashboard-title">Job Queue Dashboard</h1>
        <p className="dashboard-subtitle">Manage and monitor your background jobs in real-time</p>
      </div>
      
      {error && (
        <div className="error-banner">
          <span><strong>Error: </strong> {error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="summary-grid">
        <div className="summary-card total">
          <span className="summary-label">Total Jobs</span>
          <span className="summary-value total">{counts.total}</span>
        </div>
        <div className="summary-card pending">
          <span className="summary-label">Pending</span>
          <span className="summary-value pending">{counts.pending}</span>
        </div>
        <div className="summary-card running">
          <span className="summary-label">Running</span>
          <span className="summary-value running">{counts.running}</span>
        </div>
        <div className="summary-card completed">
          <span className="summary-label">Completed</span>
          <span className="summary-value completed">{counts.completed}</span>
        </div>
        <div className="summary-card failed">
          <span className="summary-label">Failed</span>
          <span className="summary-value failed">{counts.failed}</span>
        </div>
      </div>

      <div className="card">
        <div>
          <h3 className="card-title">Create New Job</h3>
          <p className="card-subtitle">Add a new job to the queue for asynchronous processing</p>
        </div>
        <JobForm onSubmit={handleCreate} disabled={actionInProgress || loading} />
      </div>

      <div className="card">
        <div className="controls-header">
          <div>
            <h3 className="card-title">Recent Jobs</h3>
            <p className="card-subtitle">View and manage all your jobs</p>
          </div>
          <div className="filter-group">
            <label>Filter by Status</label>
            <select 
              className="input-control" 
              style={{ minWidth: '130px', padding: '0.5rem 0.75rem' }} 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
              disabled={loading}
            >
              <option value="all">All ▼</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading jobs...</div>
        ) : (
          <JobTable 
            jobs={filteredJobs} 
            onStatusChange={handleStatusChange} 
            onDelete={handleDelete} 
            disabled={actionInProgress} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
