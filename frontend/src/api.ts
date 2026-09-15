const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

export const fetchJobs = async (): Promise<Job[]> => {
  const res = await fetch(`${API_URL}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
};

export const createJob = async (title: string, type: string): Promise<Job> => {
  const res = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, type }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create job');
  }
  return res.json();
};

export const updateJobStatus = async (id: string, status: string): Promise<Job> => {
  const res = await fetch(`${API_URL}/jobs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update job status');
  }
  return res.json();
};

export const deleteJob = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/jobs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete job');
};
