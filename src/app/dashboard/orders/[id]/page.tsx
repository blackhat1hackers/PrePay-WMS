"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Image as ImageIcon, UploadCloud, X, Edit2 } from "lucide-react";
import ImageViewerModal from "@/components/dashboard/ImageViewerModal";
import OrderModal from "@/components/dashboard/OrderModal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Image Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        router.push("/dashboard/orders");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const openViewer = (images: string[], index: number = 0) => {
    setViewerImages(images);
    setViewerIndex(index);
    setIsViewerOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    
    try {
      const uploadPromises = Array.from(e.target.files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const data = await uploadRes.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      
      const updatedArray = [...((order[category] as string[]) || []), ...urls];
      
      const patchRes = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [category]: updatedArray }),
      });
      
      if (patchRes.ok) {
        fetchOrder();
      } else {
        alert("Failed to update order with new images");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Reset input
    }
  };

  const removeImage = async (category: string, indexToRemove: number) => {
    if (!confirm("Remove this screenshot?")) return;
    
    const updatedArray = (order[category] as string[]).filter((_, i) => i !== indexToRemove);
    
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [category]: updatedArray }),
      });
      
      if (res.ok) {
        fetchOrder();
      } else {
        alert("Failed to remove image");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateUpdate = async (field: string, value: string) => {
    try {
      const dateValue = value ? new Date(value).toISOString() : null;
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: dateValue }),
      });
      if (res.ok) {
        setOrder({ ...order, [field]: dateValue });
      } else {
        alert("Failed to update date");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating date");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrder({ ...order, status: newStatus });
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if (!order) return null;

  return (
    <div className="pb-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/orders" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <div className="text-sm text-slate-500 mt-1">Created on {new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={order.status}
              onChange={handleStatusChange}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-colors hover:bg-indigo-100"
            >
              <option value="Order Done">Order Done</option>
              <option value="Review Done">Review Done</option>
              <option value="Feedback Done">Feedback Done</option>
              <option value="Rating Done">Rating Done</option>
              <option value="Refund Done">Refund Done</option>
              <option value="Commission Done">Commission Done</option>
              <option value="Completed">Completed</option>
            </select>
            <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-slate-100 text-slate-800">
              {order.marketplace}
            </span>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="ml-2 p-1.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm transition-colors"
              title="Edit Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Product Image */}
        <div className="col-span-1">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Product Image</h3>
              {order.productLinks && order.productLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap justify-end max-w-[200px]">
                  {order.productLinks.map((link: string, idx: number) => (
                    <a 
                      key={idx}
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
                      title="View Product"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      Link {idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden relative flex items-center justify-center min-h-[200px]">
              {order.productImages && order.productImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full p-2 h-full">
                  {order.productImages.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Order Details */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">Buyer Name</div>
                <div className="text-lg font-semibold text-slate-900">{order.buyer?.name || "Unknown"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">Seller Name</div>
                <div className="text-lg font-semibold text-slate-900">{order.sellerName || "N/A"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">Order Amount</div>
                <div className="text-lg font-bold text-indigo-600">${Number(order.amount).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Management Section */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Screenshots & Evidence</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Order Screenshots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-indigo-900">Order Screenshots</h3>
            <label className={`cursor-pointer inline-flex items-center justify-center p-2 rounded-lg transition-colors ${uploadingImage ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`} title="Add Order Screenshot">
              <UploadCloud className="w-4 h-4" />
              <input type="file" multiple className="sr-only" accept="image/*" onChange={(e) => handleFileUpload(e, "orderScreenshots")} disabled={uploadingImage} />
            </label>
          </div>
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submission Date</span>
            <input 
              type="date" 
              className="text-sm px-2 py-1.5 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-colors"
              value={order.orderSubmissionDate ? new Date(order.orderSubmissionDate).toISOString().split('T')[0] : ""}
              onChange={(e) => handleDateUpdate("orderSubmissionDate", e.target.value)}
            />
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 flex-1 content-start bg-slate-50/30">
            {order.orderScreenshots?.length > 0 ? (
              order.orderScreenshots.map((url: string, index: number) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white">
                  <img src={url} alt={`Order ${index+1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openViewer(order.orderScreenshots, index)} />
                  <button onClick={() => removeImage("orderScreenshots", index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-sm text-slate-400 font-medium">No order screenshots</div>
            )}
          </div>
        </div>

        {/* Review Screenshots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-fuchsia-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-fuchsia-900">Review Screenshots</h3>
            <label className={`cursor-pointer inline-flex items-center justify-center p-2 rounded-lg transition-colors ${uploadingImage ? 'bg-slate-100 text-slate-400' : 'bg-fuchsia-100 text-fuchsia-600 hover:bg-fuchsia-200'}`} title="Add Review Screenshot">
              <UploadCloud className="w-4 h-4" />
              <input type="file" multiple className="sr-only" accept="image/*" onChange={(e) => handleFileUpload(e, "reviewScreenshots")} disabled={uploadingImage} />
            </label>
          </div>
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submission Date</span>
            <input 
              type="date" 
              className="text-sm px-2 py-1.5 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none text-slate-700 transition-colors"
              value={order.reviewSubmissionDate ? new Date(order.reviewSubmissionDate).toISOString().split('T')[0] : ""}
              onChange={(e) => handleDateUpdate("reviewSubmissionDate", e.target.value)}
            />
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 flex-1 content-start bg-slate-50/30">
            {order.reviewScreenshots?.length > 0 ? (
              order.reviewScreenshots.map((url: string, index: number) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white">
                  <img src={url} alt={`Review ${index+1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openViewer(order.reviewScreenshots, index)} />
                  <button onClick={() => removeImage("reviewScreenshots", index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-sm text-slate-400 font-medium">No review screenshots</div>
            )}
          </div>
        </div>

      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={viewerImages}
        initialIndex={viewerIndex}
      />
      
      <OrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchOrder}
        order={order}
      />
    </div>
  );
}
