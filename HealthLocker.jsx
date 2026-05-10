import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Image as ImageIcon, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import api, { BACKEND_URL } from './api';
import { useAuth } from './AuthContext';
import './HealthLocker.css';

const HealthLocker = () => {
  const { theme } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/locker');
      const recordList = res?.data?.data?.records || [];
      setRecords(recordList);
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/locker/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Real-time Sync: Update state immediately after upload
      setRecords(prev => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/locker/${filename}`);
      setRecords(prev => prev.filter(r => r.id !== filename));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleView = async (filename) => {
    try {
      const res = await api.get(`/locker/view/${filename}`, {
        responseType: 'blob'
      });
      
      // Ensure we use the correct content type from the server
      const contentType = res.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Use an anchor tag trick to bypass most popup blockers
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      // If it's a download rather than view, you could add:
      // link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL after a delay to ensure the browser has time to load it
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("View failed", err);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="locker-container min-h-full relative transition-colors duration-1000">
      <div className="locker-header relative z-10 px-6 pt-6">
        <h1 className={`text-4xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Health <span className="text-sky-500">Locker</span>
        </h1>
        <label className="upload-btn">
          <Plus size={20} />
          <span>{uploading ? 'Processing...' : 'Upload Record'}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="bento-grid relative z-10 p-6">
        {records.map((record) => (
          <div 
            key={record.id} 
            className={`bento-item ${record.grid_size || 'w-full md:col-span-1'}`}>
            <div className="record-card">
              <div className="icon-wrapper">
                {record.type?.includes('pdf') ? <FileText size={40} className="text-red-500" /> : <ImageIcon size={40} className="text-blue-500" />}
              </div>
              <div className="record-info">
                <h3 className="record-name">{record.name}</h3>
                <p className="record-date">{record.last_modified}</p>
                <div className={`relevance-tag ${(record.triage_relevance || 'Low').toLowerCase()}`}>
                  {record.triage_relevance || 'Standard'} Relevance
                </div>
              </div>
              <div className="record-actions">
                <button onClick={() => handleView(record.id)} className="action-btn" title="View Decrypted">
                  <ExternalLink size={18} />
                </button>
                <button onClick={() => handleDelete(record.id)} className="action-btn delete" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthLocker;