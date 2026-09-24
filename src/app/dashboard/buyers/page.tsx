"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Search, Loader2, Star } from "lucide-react";
import BuyerModal from "@/components/dashboard/BuyerModal";

type Buyer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  stateOrCity: string | null;
  address: string | null;
  accountStatus: string;
  verificationStatus: string;
  notes: string | null;
  createdAt: string;
  imageUrl?: string | null;
  availableBalance?: number;
  trustRating?: number;
};

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);

  const fetchBuyers = async () => {
    try {
      const res = await fetch("/api/buyers");
      const data = await res.json();
      setBuyers(data);
    } catch (err) {
      console.error("Failed to fetch buyers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    
    try {
      const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBuyers(prev => prev.filter(b => b.id !== id));
      } else {
        alert("Failed to delete buyer");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingBuyer(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Buyer Management</h1>
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Buyer
        </button>
      </div>

      <div className="bg-transparent">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : buyers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white shadow-sm rounded-2xl border border-slate-200">
            No buyers found. Click "Add Buyer" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {buyers.map((buyer) => (
              <div key={buyer.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.preventDefault(); handleEdit(buyer); }}
                    className="p-1.5 bg-white/90 text-slate-500 hover:text-indigo-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(buyer.id); }}
                    className="p-1.5 bg-white/90 text-slate-500 hover:text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <Link href={`/dashboard/buyers/${buyer.id}`} className="flex-1 p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-50 bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-4 flex-shrink-0">
                    {buyer.imageUrl ? (
                      <img src={buyer.imageUrl} alt={buyer.name} className="w-full h-full object-cover" />
                    ) : (
                      buyer.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{buyer.name}</h3>
                  <div className="text-sm text-slate-500 mt-1 truncate w-full px-4">{buyer.email || "No email"}</div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= (buyer.trustRating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                      />
                    ))}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      buyer.accountStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {buyer.accountStatus}
                    </span>
                    {(buyer.country || buyer.stateOrCity) && (
                      <span className="inline-flex px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                        {buyer.stateOrCity ? `${buyer.stateOrCity}, ` : ''}{buyer.country}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Loan Credit</span>
                    <span className={`font-bold ${Number(buyer.availableBalance) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${Number(buyer.availableBalance || 0).toFixed(2)}
                    </span>
                  </div>
                </Link>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-500 flex justify-between items-center mt-auto">
                  <span>{buyer.phone || "No phone"}</span>
                  <Link href={`/dashboard/buyers/${buyer.id}`} className="text-indigo-600 font-medium hover:text-indigo-700">
                    View Profile &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BuyerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBuyers}
        buyer={editingBuyer}
      />
    </div>
  );
}
