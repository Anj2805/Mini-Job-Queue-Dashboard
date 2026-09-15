import { useState } from 'react';

interface JobFormProps {
  onSubmit: (title: string, type: string) => Promise<void>;
  disabled: boolean;
}

export function JobForm({ onSubmit, disabled }: JobFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !type.trim()) return;
    await onSubmit(title, type);
    setTitle('');
    setType('');
  };

  return (
    <form onSubmit={handleSubmit} className="form-row">
      <input 
        className="input-control"
        placeholder="Job Title (e.g. Weekly Report)"
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        disabled={disabled} 
        required 
      />
      <input 
        className="input-control"
        placeholder="Job Type (e.g. Export)"
        value={type} 
        onChange={e => setType(e.target.value)} 
        disabled={disabled} 
        required 
      />
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={disabled || !title.trim() || !type.trim()}
      >
        Create Job
      </button>
    </form>
  );
}
