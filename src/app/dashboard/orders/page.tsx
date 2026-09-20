"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import OrderModal from "@/components/dashboard/OrderModal";
import OrderCard from "@/components/dashboard/OrderCard";

type Order = {
  id: string;
  orderNumber: string;
  marketplace: string;
  amount: number;
  status: string;
  buyerId: string;
  productImage?: string | null;
  orderScreenshots: string[];
  reviewScreenshots: string[];
  refundScreenshots: string[];
  buyer?: {
    name: string;
  };
  cashback?: {
    status: string;
  } | null;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order? Associated cashback will also be deleted.")) return;
    
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        alert("Failed to delete order");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesSearch = !searchQuery || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </button>
      </div>

      <div className="bg-transparent">
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Order Done">Order Done</option>
            <option value="Review Done">Review Done</option>
            <option value="Feedback Done">Feedback Done</option>
            <option value="Rating Done">Rating Done</option>
            <option value="Refund Done">Refund Done</option>
            <option value="Commission Done">Commission Done</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white shadow-sm rounded-2xl border border-slate-200">
            No orders found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                showBuyer={true}
              />
            ))}
          </div>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchOrders}
        order={editingOrder}
      />
    </div>
  );
}
