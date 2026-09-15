import type { Job } from '../api';

interface JobTableProps {
  jobs: Job[];
  onStatusChange: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled: boolean;
}

export function JobTable({ jobs, onStatusChange, onDelete, disabled }: JobTableProps) {
  if (jobs.length === 0) {
    return <div className="empty-state">No jobs found matching the current filter.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => {
            const isDemo = job.id.startsWith('demo-');
            
            return (
              <tr key={job.id}>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{job.title}</td>
                <td style={{ color: 'var(--text-muted)' }}>{job.type}</td>
                <td>
                  <span className={`badge ${job.status}`}>
                    {job.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {new Date(job.createdAt).toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </td>
                <td className="actions-cell">
                  {job.status === 'pending' && (
                    <button 
                      className="btn btn-sm btn-outline"
                      disabled={disabled || isDemo} 
                      onClick={() => onStatusChange(job.id, 'running')}
                      title={isDemo ? "Demo jobs cannot be modified" : "Start Job"}
                    >
                      Start
                    </button>
                  )}
                  {job.status === 'running' && (
                    <>
                      <button 
                        className="btn btn-sm btn-outline"
                        disabled={disabled || isDemo} 
                        onClick={() => onStatusChange(job.id, 'completed')}
                        title={isDemo ? "Demo jobs cannot be modified" : "Mark Completed"}
                      >
                        Complete
                      </button>
                      <button 
                        className="btn btn-sm btn-outline"
                        disabled={disabled || isDemo} 
                        onClick={() => onStatusChange(job.id, 'failed')}
                        title={isDemo ? "Demo jobs cannot be modified" : "Mark Failed"}
                      >
                        Fail
                      </button>
                    </>
                  )}
                  <button 
                    className="btn btn-sm btn-danger-text"
                    disabled={disabled || isDemo} 
                    onClick={() => onDelete(job.id)}
                    title={isDemo ? "Demo jobs cannot be modified" : "Delete Job"}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
