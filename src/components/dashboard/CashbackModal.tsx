"use client";

import { useState, useEffect } from "react";
import { X, Loader2, UploadCloud } from "lucide-react";

type Cashback = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentDetails: string | null;
  screenshots: string[];
  order?: {
    orderNumber: string;
    buyer?: {
      name: string;
    } | null;
  } | null;
};

interface CashbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cashback?: Cashback | null;
}

export default function CashbackModal({ isOpen, onClose, onSuccess, cashback }: CashbackModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<Partial<Cashback>>({
    amount: 0,
    status: "Pending",
    paymentMethod: "",
    paymentDetails: "",
    screenshots: [],
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (cashback) {
      setFormData({
        amount: cashback.amount,
        status: cashback.status,
        paymentMethod: cashback.paymentMethod || "",
        paymentDetails: cashback.paymentDetails || "",
        screenshots: cashback.screenshots || [],
      });
    }
    setError("");
  }, [cashback, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashback) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/cashback/${cashback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const text = await res.text();
        setError(text || "An error occurred");
      }
    } catch (err) {
      setError("Failed to save cashback");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    setError("");
    
    try {
      const uploadPromises = Array.from(e.target.files).map(async (file) => {
        const fileData = new FormData();
        fileData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fileData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({ 
        ...prev, 
        screenshots: [...((prev.screenshots as string[]) || []), ...urls] 
      }));
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: (prev.screenshots || []).filter((_, i) => i !== indexToRemove)
    }));
  };

  if (!isOpen || !cashback) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Update Cashback
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Order: {cashback.order?.orderNumber} ({cashback.order?.buyer?.name || "Unknown"})
              </p>
            </div>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Method</option>
                <option value="PayPal">PayPal</option>
                <option value="Venmo">Venmo</option>
                <option value="Gift Card">Gift Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Details (Transaction ID)</label>
              <input
                name="paymentDetails"
                value={formData.paymentDetails || ""}
                onChange={handleChange}
                placeholder="e.g. 9X291039..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Screenshots / Evidence</label>
                <label className={`cursor-pointer inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${uploadingImage ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                  {uploadingImage ? 'Uploading...' : 'Add Images'}
                  <input type="file" multiple className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={uploadingImage} />
                </label>
              </div>
              
              {formData.screenshots && formData.screenshots.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {formData.screenshots.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
