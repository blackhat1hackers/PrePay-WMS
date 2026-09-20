"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Upload, Image as ImageIcon } from "lucide-react";

type Buyer = {
  id: string;
  name: string;
};

type Order = {
  id?: string;
  orderNumber: string;
  marketplace: string;
  sellerName?: string | null;
  amount: number;
  status: string;
  buyerId: string;
  productImage?: string;
  productLink?: string;
  orderScreenshots: string[];
  orderSubmissionDate?: string | null;
  reviewSubmissionDate?: string | null;
};

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: Order | null;
}

const ImageUploadSection = ({ title, category, urls, uploading, onUpload, onRemove }: any) => (
  <div className="border border-slate-200 rounded-lg p-3 bg-white">
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm font-medium text-slate-700">{title}</span>
      <label className={`cursor-pointer text-xs font-medium px-3 py-1.5 rounded transition-colors ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
        {uploading ? 'Uploading...' : 'Add Images'}
        <input type="file" multiple className="sr-only" accept="image/*" onChange={onUpload} disabled={uploading} />
      </label>
    </div>
    
    {urls && urls.length > 0 ? (
      <div className="grid grid-cols-2 gap-2">
        {urls.map((url: string, idx: number) => (
          <div key={idx} className="relative group rounded-md overflow-hidden border border-slate-200 aspect-square">
            <img src={url} alt={`${title} ${idx}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onRemove(idx)} className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/50 rounded border border-dashed border-slate-200">
        No images
      </div>
    )}
  </div>
);

export default function OrderModal({ isOpen, onClose, onSuccess, order }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<Order>({
    orderNumber: "",
    marketplace: "Amazon",
    sellerName: "",
    amount: 0,
    status: "Order Done",
    buyerId: "",
    productImage: "",
    productLink: "",
    orderScreenshots: [],
    orderSubmissionDate: "",
    reviewSubmissionDate: "",
  });

  useEffect(() => {
    // Fetch buyers for the dropdown
    if (isOpen) {
      fetch("/api/buyers")
        .then(res => res.json())
        .then(data => {
          setBuyers(data);
          if (!order && data.length > 0 && !formData.buyerId) {
            setFormData(prev => ({ ...prev, buyerId: data[0].id }));
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber,
        marketplace: order.marketplace,
        sellerName: order.sellerName || "",
        amount: order.amount,
        status: order.status,
        buyerId: order.buyerId,
        productImage: order.productImage || "",
        productLink: order.productLink || "",
        orderScreenshots: order.orderScreenshots || [],
        orderSubmissionDate: order.orderSubmissionDate ? new Date(order.orderSubmissionDate).toISOString().split('T')[0] : "",
        reviewSubmissionDate: order.reviewSubmissionDate ? new Date(order.reviewSubmissionDate).toISOString().split('T')[0] : "",
      });
    } else {
      setFormData(prev => ({
        orderNumber: "",
        marketplace: "Amazon",
        sellerName: "",
        amount: 0,
        status: "Order Done",
        buyerId: prev.buyerId || (buyers[0]?.id || ""),
        productImage: "",
        productLink: "",
        orderScreenshots: [],
        orderSubmissionDate: "",
        reviewSubmissionDate: "",
      }));
    }
    setError("");
  }, [order, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: keyof Order) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          return data.url;
        }
        throw new Error("Upload failed");
      });

      const urls = await Promise.all(uploadPromises);
      
      if (category === "productImage") {
         setFormData(prev => ({ ...prev, productImage: urls[0] }));
      } else {
         setFormData(prev => ({ 
           ...prev, 
           [category]: [...((prev[category] as string[]) || []), ...urls] 
         }));
      }
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (category: keyof Order, index: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] as string[]).filter((_, i) => i !== index)
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = order?.id ? `/api/orders/${order.id}` : "/api/orders";
      const method = order?.id ? "PATCH" : "POST";
      
      const payload = { ...formData };
      
      if (payload.orderSubmissionDate) {
        payload.orderSubmissionDate = new Date(payload.orderSubmissionDate).toISOString();
      } else {
        payload.orderSubmissionDate = null as any;
      }
      
      if (payload.reviewSubmissionDate) {
        payload.reviewSubmissionDate = new Date(payload.reviewSubmissionDate).toISOString();
      } else {
        payload.reviewSubmissionDate = null as any;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const text = await res.text();
        setError(text || "An error occurred");
      }
    } catch (err) {
      setError("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-slate-900">
              {order?.id ? "Edit Order" : "Add New Order"}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              {!order?.id && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Buyer *</label>
                  <select
                    required
                    name="buyerId"
                    value={formData.buyerId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" disabled>Select a Buyer</option>
                    {buyers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={order?.id ? "col-span-2" : "col-span-1"}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Number *</label>
                <input
                  required
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="e.g. 114-1234567-8901234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                 <div className="flex items-center gap-4">
                    {formData.productImage ? (
                      <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                         <img src={formData.productImage} alt="Product" className="w-full h-full object-cover" />
                         <button type="button" onClick={() => setFormData(prev => ({ ...prev, productImage: "" }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                         </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                         <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <label className={`cursor-pointer text-sm font-medium px-4 py-2 rounded-lg transition-colors ${uploadingImage ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                      {uploadingImage ? 'Uploading...' : (formData.productImage ? 'Change Image' : 'Upload Product Image')}
                      <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileUpload(e, "productImage")} disabled={uploadingImage} />
                    </label>
                 </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Link</label>
                <input
                  type="url"
                  name="productLink"
                  value={formData.productLink || ""}
                  onChange={handleChange}
                  placeholder="https://www.amazon.com/dp/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marketplace</label>
                <select
                  name="marketplace"
                  value={formData.marketplace}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Amazon">Amazon</option>
                  <option value="Walmart">Walmart</option>
                  <option value="Target">Target</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seller Name</label>
                <input
                  name="sellerName"
                  value={formData.sellerName || ""}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

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
                  <option value="Order Done">Order Done</option>
                  <option value="Review Done">Review Done</option>
                  <option value="Feedback Done">Feedback Done</option>
                  <option value="Rating Done">Rating Done</option>
                  <option value="Refund Done">Refund Done</option>
                  <option value="Commission Done">Commission Done</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Submission Date</label>
                <input
                  type="date"
                  name="orderSubmissionDate"
                  value={formData.orderSubmissionDate || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Review Submission Date</label>
                <input
                  type="date"
                  name="reviewSubmissionDate"
                  value={formData.reviewSubmissionDate || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Order Screenshots</h4>
              <div className="grid grid-cols-1 gap-4">
                <ImageUploadSection 
                  title="Order Receipt / Confirmation" 
                  category="orderScreenshots"
                  urls={formData.orderScreenshots} 
                  uploading={uploadingImage} 
                  onUpload={(e: any) => handleFileUpload(e, "orderScreenshots")}
                  onRemove={(i: number) => removeImage("orderScreenshots", i)}
                />
              </div>
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
                {order?.id ? "Save Changes" : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
