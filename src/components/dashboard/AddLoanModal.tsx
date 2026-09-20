"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Upload } from "lucide-react";

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  buyerId: string;
  editLog?: any;
}

export default function AddLoanModal({ isOpen, onClose, onSuccess, buyerId, editLog }: AddLoanModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  useEffect(() => {
    if (editLog) {
      setAmount(editLog.type === 'Manual Deduction' ? `-${editLog.amount}` : editLog.amount.toString());
      setNotes(editLog.notes || "");
      setDocumentUrl(editLog.documentUrl || "");
    } else {
      setAmount("");
      setNotes("");
      setDocumentUrl("");
    }
    setError("");
  }, [editLog, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setDocumentUrl(data.url);
      } else {
        setError("Failed to upload image");
      }
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editLog ? `/api/wallet/${editLog.id}` : `/api/buyers/${buyerId}/fund`;
      const method = editLog ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), notes, type: "Loan", documentUrl }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        if (!editLog) {
          setAmount("");
          setNotes("");
          setDocumentUrl("");
        }
      } else {
        const text = await res.text();
        setError(text || "Failed to add fund");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-slate-900">{editLog ? "Edit Fund Transaction" : "Add Loan Fund"}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 20.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">Use a negative number to manually deduct funds.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Approved by Admin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document / Receipt (Optional)</label>
              <div className="flex items-center gap-4">
                {documentUrl && (
                  <div className="w-16 h-16 rounded border border-slate-200 overflow-hidden">
                    <img src={documentUrl} alt="Receipt" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <Upload className="w-4 h-4 text-slate-500" />}
                  <span className="text-sm font-medium text-slate-700">{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadingImage} />
                </label>
                {documentUrl && (
                  <button type="button" onClick={() => setDocumentUrl("")} className="text-sm text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
