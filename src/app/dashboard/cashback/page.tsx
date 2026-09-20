"use client";

import { useState, useEffect } from "react";
import { Edit2, Search, Loader2, DollarSign } from "lucide-react";
import CashbackModal from "@/components/dashboard/CashbackModal";

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
    };
  };
  createdAt: string;
};

export default function CashbackPage() {
  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashback, setEditingCashback] = useState<Cashback | null>(null);

  const fetchCashbacks = async () => {
    try {
      const res = await fetch("/api/cashback");
      const data = await res.json();
      setCashbacks(data);
    } catch (err) {
      console.error("Failed to fetch cashback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashbacks();
  }, []);

  const handleEdit = (cashback: Cashback) => {
    setEditingCashback(cashback);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-800";
      case "Approved": return "bg-blue-100 text-blue-800";
      case "Paid": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const totalPaid = cashbacks
    .filter(c => c.status === "Paid")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const totalPending = cashbacks
    .filter(c => c.status === "Pending" || c.status === "Approved")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Cashback Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending / Approved</p>
            <h3 className="text-2xl font-bold text-slate-900">${totalPending.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Paid Out</p>
            <h3 className="text-2xl font-bold text-slate-900">${totalPaid.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search cashback..."
              className="block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order & Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Info</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : cashbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No cashback records found. Add an Order first.
                  </td>
                </tr>
              ) : (
                cashbacks.map((cashback) => (
                  <tr key={cashback.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{cashback.order?.orderNumber || "Unknown Order"}</span>
                        <span className="text-xs font-medium text-slate-500">Buyer: {cashback.order?.buyer?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">${Number(cashback.amount).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cashback.status)}`}>
                        {cashback.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900">{cashback.paymentMethod || "-"}</span>
                        <span className="text-xs text-slate-500">{cashback.paymentDetails || ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(cashback)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-1.5" />
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CashbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCashbacks}
        cashback={editingCashback}
      />
    </div>
  );
}
