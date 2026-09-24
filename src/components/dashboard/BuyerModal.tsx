"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Upload } from "lucide-react";

type Buyer = {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  stateOrCity: string | null;
  address: string | null;
  accountStatus: string;
  verificationStatus: string;
  notes: string | null;
  paypalEmail: string | null;
  facebookLink: string | null;
  amazonReviewLink?: string | null;
  imageUrl?: string | null;
  walmartScreenshot?: string | null;
};

interface BuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  buyer?: any; // null for create, object for edit
}

export default function BuyerModal({ isOpen, onClose, onSuccess, buyer }: BuyerModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "USA",
    stateOrCity: "",
    address: "",
    notes: "",
    paypalEmail: "",
    facebookLink: "",
    amazonReviewLink: "",
    accountStatus: "Active",
    imageUrl: "",
    walmartScreenshot: "",
  });

  useEffect(() => {
    if (buyer) {
      setFormData({
        name: buyer.name || "",
        email: buyer.email || "",
        phone: buyer.phone || "",
        country: buyer.country || "USA",
        stateOrCity: buyer.stateOrCity || "",
        address: buyer.address || "",
        notes: buyer.notes || "",
        paypalEmail: buyer.paypalEmail || "",
        facebookLink: buyer.facebookLink || "",
        amazonReviewLink: buyer.amazonReviewLink || "",
        accountStatus: buyer.accountStatus || "Active",
        imageUrl: buyer.imageUrl || "",
        walmartScreenshot: buyer.walmartScreenshot || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "USA",
        stateOrCity: "",
        address: "",
        notes: "",
        paypalEmail: "",
        facebookLink: "",
        amazonReviewLink: "",
        accountStatus: "Active",
        imageUrl: "",
        walmartScreenshot: "",
      });
    }
    setError("");
  }, [buyer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        setError("Failed to upload image");
      }
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleWalmartScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData(prev => ({ ...prev, walmartScreenshot: data.url }));
      } else {
        setError("Failed to upload walmart screenshot");
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
      const url = buyer ? `/api/buyers/${buyer.id}` : "/api/buyers";
      const method = buyer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
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
      setError("Failed to save buyer");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-slate-900">
              {buyer ? "Edit Buyer Profile" : "Add New Buyer"}
            </h3>
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
            
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-50 bg-slate-100 flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mb-1" />}
                  <span className="text-xs font-medium">{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State / City</label>
                <input
                  name="stateOrCity"
                  value={formData.stateOrCity}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, NY 10001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PayPal Email</label>
                <input
                  type="email"
                  name="paypalEmail"
                  value={formData.paypalEmail}
                  onChange={handleChange}
                  placeholder="paypal@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook Link</label>
                <input
                  type="url"
                  name="facebookLink"
                  value={formData.facebookLink}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amazon Review Link</label>
              <input
                type="url"
                name="amazonReviewLink"
                value={formData.amazonReviewLink}
                onChange={handleChange}
                placeholder="https://amazon.com/gp/profile/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Walmart Profile Screenshot</label>
              <div className="flex items-center gap-4">
                 {formData.walmartScreenshot ? (
                   <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={formData.walmartScreenshot} alt="Walmart Profile" className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(formData.walmartScreenshot, '_blank')} />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, walmartScreenshot: "" }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <X className="w-3 h-3" />
                      </button>
                   </div>
                 ) : (
                   <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-slate-400" />
                   </div>
                 )}
                 <label className={`cursor-pointer text-sm font-medium px-4 py-2 rounded-lg transition-colors ${uploadingImage ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                   {uploadingImage ? 'Uploading...' : (formData.walmartScreenshot ? 'Change Image' : 'Upload Walmart Profile Screenshot')}
                   <input type="file" className="sr-only" accept="image/*" onChange={handleWalmartScreenshotUpload} disabled={uploadingImage} />
                 </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or notes about this buyer..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
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
                disabled={loading || uploadingImage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {buyer ? "Save Changes" : "Add Buyer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
