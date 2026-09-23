import { db } from "@/lib/db";
import Link from "next/link";
import { Clock, CheckCircle2, DollarSign, Users } from "lucide-react";

export default async function DashboardPage() {
  const [totalBuyers, pendingOrdersCount, pendingCashbackAgg, totalPaidAgg, recentOrders] = await Promise.all([
    db.buyer.count(),
    db.order.count({
      where: { status: { notIn: ['Completed', 'Cancelled'] } }
    }),
    db.cashback.aggregate({
      _sum: { amount: true },
      where: { status: 'Pending' }
    }),
    db.cashback.aggregate({
      _sum: { amount: true },
      where: { status: 'Paid' }
    }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { buyer: true }
    })
  ]);

  const pendingCashback = pendingCashbackAgg._sum.amount || 0;
  const totalPaid = totalPaidAgg._sum.amount || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 truncate">Total Buyers</dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">{totalBuyers}</dd>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 truncate">Pending Orders</dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">{pendingOrdersCount}</dd>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 truncate">Pending Cashback</dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">${pendingCashback.toFixed(2)}</dd>
          </div>
        </div>
        
        {/* Card 4 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 truncate">Total Paid</dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">${totalPaid.toFixed(2)}</dd>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <p>No recent activity found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <Link href={`/dashboard/orders/${order.id}`}>#{order.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                      <Link href={`/dashboard/buyers/${order.buyerId}`} className="hover:underline">{order.buyer?.name}</Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ${Number(order.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
