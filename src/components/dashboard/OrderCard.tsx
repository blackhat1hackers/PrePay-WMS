"use client";

import Link from "next/link";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  marketplace: string;
  amount: number;
  status: string;
  buyerId: string;
  productImage?: string | null;
  buyer?: {
    name: string;
  };
  cashback?: {
    status: string;
  } | null;
  createdAt: string;
};

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete?: (id: string) => void;
  showBuyer?: boolean;
}

export default function OrderCard({ order, onEdit, onDelete, showBuyer = true }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Order Done": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Review Done": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Feedback Done": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Rating Done": return "bg-lime-100 text-lime-800 border-lime-200";
      case "Refund Done": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Commission Done": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getCashbackStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-slate-100 text-slate-600 border-slate-200";
      case "Approved": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Paid": return "bg-green-50 text-green-700 border-green-200";
      case "Rejected": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col">
      <div className="absolute top-3 right-3 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(order); }}
          className="p-1.5 bg-white/90 text-slate-500 hover:text-indigo-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors border border-slate-100"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(order.id); }}
            className="p-1.5 bg-white/90 text-slate-500 hover:text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors border border-slate-100"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <Link href={`/dashboard/orders/${order.id}`} className="flex-1 flex flex-col">
        {/* Product Image Area */}
        <div className="w-full h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
          {order.productImage ? (
            <img src={order.productImage} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="text-slate-300 flex flex-col items-center">
              <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
              <span className="text-xs font-medium">No Image</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
             <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border shadow-sm backdrop-blur-md bg-white/80 ${getStatusColor(order.status)}`}>
               {order.status}
             </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="text-xs font-medium text-slate-400 mb-1">{order.marketplace}</div>
          <h3 className="text-base font-bold text-slate-900 mb-1 truncate group-hover:text-indigo-600 transition-colors" title={order.orderNumber}>
            #{order.orderNumber}
          </h3>
          
          {showBuyer && order.buyer && (
            <div className="text-sm text-slate-600 mb-3 truncate">
               <span className="text-slate-400">Buyer:</span> {order.buyer.name}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
            <div className="text-lg font-black text-slate-900">
               ${Number(order.amount).toFixed(2)}
            </div>
            <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors shadow-sm">
              {(order.reviewScreenshots?.length > 0 || order.status !== "Order Done") ? "View Details" : "Add Review"}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
