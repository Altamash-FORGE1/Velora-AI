import React, { useState, useEffect } from 'react';
import { Plus, FileText, Image as ImageIcon, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import api, { BACKEND_URL } from './api';
import './HealthLocker.css';

const HealthLocker = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/locker');
      setRecords(res.data.data.records);
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

  const handleView = (filename) => {
    window.open(`${BACKEND_URL}/api/locker/view/${filename}`, '_blank');
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="locker-container">
      <div className="locker-header">
        <h1 className="text-2xl font-bold text-gray-900">Health Locker</h1>
        <label className="upload-btn">
          <Plus size={20} />
          <span>{uploading ? 'Processing...' : 'Upload Record'}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="bento-grid">
        {records.map((record) => (
          <div key={record.id} className={`bento-item ${record.grid_size}`}>
            <div className="record-card">
              <div className="icon-wrapper">
                {record.type.includes('pdf') ? <FileText size={40} className="text-red-500" /> : <ImageIcon size={40} className="text-blue-500" />}
              </div>
              <div className="record-info">
                <h3 className="record-name">{record.name}</h3>
                <p className="record-date">{record.last_modified}</p>
                <div className={`relevance-tag ${record.triage_relevance.toLowerCase()}`}>
                  {record.triage_relevance} Relevance
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