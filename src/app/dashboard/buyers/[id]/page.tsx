"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Plus, Mail, Phone, MapPin, DollarSign, Loader2, Info, Wallet, History, ImageIcon, Link as LinkIcon, Trash2 } from "lucide-react";
import BuyerModal from "@/components/dashboard/BuyerModal";
import OrderModal from "@/components/dashboard/OrderModal";
import OrderCard from "@/components/dashboard/OrderCard";
import AddLoanModal from "@/components/dashboard/AddLoanModal";

export default function BuyerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const buyerId = params.id as string;

  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEditBuyerOpen, setIsEditBuyerOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("orders");

  const fetchBuyerData = async () => {
    try {
      const res = await fetch(`/api/buyers/${buyerId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setBuyer(data);
    } catch (err) {
      console.error(err);
      router.push("/dashboard/buyers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [buyerId]);

  const handleDeleteBuyer = async () => {
    if (!confirm("Are you sure you want to delete this buyer? This will also delete all their orders and wallet logs.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/buyers/${buyerId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push("/dashboard/buyers");
      } else {
        const text = await res.text();
        alert(text || "Failed to delete buyer");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete buyer");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBuyerData();
      } else {
        const text = await res.text();
        alert(text || "Failed to delete order");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This will reverse the balance adjustment.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/wallet/${logId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBuyerData();
      } else {
        const text = await res.text();
        alert(text || "Failed to delete transaction");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!buyer) return null;

  const totalOrdersCount = buyer.orders?.length || 0;
  const totalSpent = buyer.orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0;
  const totalCashbackPaid = buyer.orders?.reduce((sum: number, o: any) => {
    if (o.cashback && o.cashback.status === "Paid") {
      return sum + Number(o.cashback.amount);
    }
    return sum;
  }, 0) || 0;

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Order Done": return "bg-blue-100 text-blue-800";
      case "Review Done": return "bg-amber-100 text-amber-800";
      case "Feedback Done": return "bg-yellow-100 text-yellow-800";
      case "Rating Done": return "bg-lime-100 text-lime-800";
      case "Refund Done": return "bg-purple-100 text-purple-800";
      case "Commission Done": return "bg-orange-100 text-orange-800";
      case "Completed": return "bg-emerald-100 text-emerald-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getCashbackStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-slate-100 text-slate-600 border border-slate-200";
      case "Approved": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Paid": return "bg-green-50 text-green-700 border border-green-200";
      case "Rejected": return "bg-red-50 text-red-700 border border-red-200";
      default: return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/buyers")}
            className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {buyer.name}
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                buyer.accountStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {buyer.accountStatus}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Buyer Profile Overview</p>
          </div>
        </div>
        
        <button
          onClick={handleDeleteBuyer}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Buyer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Buyer Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group">
            <button
              onClick={() => setIsEditBuyerOpen(true)}
              className="absolute top-4 right-4 p-2 text-slate-400 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50/50 to-white flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold mb-4">
                {buyer.imageUrl ? (
                  <img src={buyer.imageUrl} alt={buyer.name} className="w-full h-full object-cover" />
                ) : (
                  buyer.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{buyer.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                {buyer.email || "No email provided"}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-sm text-slate-900">{buyer.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">PayPal Email</p>
                  <p className="text-sm text-slate-900">{buyer.paypalEmail || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LinkIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Facebook</p>
                  {buyer.facebookLink ? (
                    <a href={buyer.facebookLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                      {buyer.facebookLink}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-900">-</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LinkIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Amazon Review</p>
                  {buyer.amazonReviewLink ? (
                    <a href={buyer.amazonReviewLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                      {buyer.amazonReviewLink}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-900">-</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-sm text-slate-900">{buyer.address ? `${buyer.address}, ` : ''}{buyer.stateOrCity ? `${buyer.stateOrCity}, ` : ''}{buyer.country || "-"}</p>
                </div>
              </div>
              {buyer.notes && (
                <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Notes</p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">{buyer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Orders</p>
              <h4 className="text-2xl font-bold text-slate-900">{totalOrdersCount}</h4>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Spent</p>
              <h4 className="text-2xl font-bold text-slate-900">${totalSpent.toFixed(2)}</h4>
            </div>
            <div className="col-span-2 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-sm text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-emerald-100">Available Balance</p>
                </div>
                <button onClick={() => { setEditingLog(null); setIsAddLoanOpen(true); }} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                  Add Funds
                </button>
              </div>
              <h4 className="text-3xl font-bold">${Number(buyer.availableBalance || 0).toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {/* Right Col: Orders & Cashback */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-fit shadow-inner">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'wallet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              Wallet History
            </button>
          </div>
          
          {activeTab === "orders" ? (
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Order History</h3>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setIsOrderModalOpen(true);
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Order
              </button>
            </div>

            {buyer.orders?.length === 0 ? (
               <div className="p-12 text-center text-slate-500 bg-white shadow-sm rounded-2xl border border-slate-200">
                  No orders yet. Add an order to start tracking.
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {buyer.orders?.map((order: any) => (
                   <OrderCard 
                     key={order.id} 
                     order={order} 
                     onEdit={(o) => {
                       setEditingOrder(o);
                       setIsOrderModalOpen(true);
                     }}
                     onDelete={handleDeleteOrder}
                     showBuyer={false}
                   />
                 ))}
               </div>
            )}
            
            {buyer.orders?.length > 0 && (
              <div className="mt-6 p-4 bg-white shadow-sm rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                To manage cashback details (like Payment Method), go to the main Cashback page.
              </div>
            )}
          </div>
          ) : (
            <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-500" />
                  Transaction History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {!buyer.walletLogs || buyer.walletLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-slate-500 bg-slate-50/50">
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      buyer.walletLogs.map((log: any) => {
                        let orderLink = null;
                        if (log.type === "Order Deduction" && log.notes?.startsWith("Deduction for Order #")) {
                          const match = log.notes.match(/Order #(.+)/);
                          if (match) {
                            const orderNum = match[1];
                            const relatedOrder = buyer.orders?.find((o: any) => o.orderNumber === orderNum);
                            if (relatedOrder) {
                              orderLink = `/dashboard/orders/${relatedOrder.id}`;
                            }
                          }
                        }
                        
                        return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                              log.type.includes('Deduction') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className={`px-5 py-4 whitespace-nowrap text-sm font-bold ${
                            log.type.includes('Deduction') ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {log.type.includes('Deduction') ? '-' : '+'}${Number(log.amount).toFixed(2)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {log.documentUrl ? (
                              <a href={log.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                                <ImageIcon className="w-4 h-4" />
                                View
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {orderLink ? (
                              <Link href={orderLink} className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1" title="View Order Details">
                                <LinkIcon className="w-3 h-3" />
                                {log.notes}
                              </Link>
                            ) : (
                              log.notes || '-'
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={(e) => { e.preventDefault(); setEditingLog(log); setIsAddLoanOpen(true); }}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); handleDeleteLog(log.id); }}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <BuyerModal
        isOpen={isEditBuyerOpen}
        onClose={() => setIsEditBuyerOpen(false)}
        onSuccess={fetchBuyerData}
        buyer={buyer}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={fetchBuyerData}
        order={editingOrder || { buyerId: buyer.id, orderNumber: "", marketplace: "Amazon", amount: 0, status: "Order Done" }}
      />
      
      <AddLoanModal
        isOpen={isAddLoanOpen}
        onClose={() => setIsAddLoanOpen(false)}
        onSuccess={fetchBuyerData}
        buyerId={buyer.id}
        editLog={editingLog}
      />

    </div>
  );
}
