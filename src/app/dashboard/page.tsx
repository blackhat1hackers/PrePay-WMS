export default async function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Total Buyers</dt>
          <dd className="mt-2 text-3xl font-semibold text-indigo-600">--</dd>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Pending Orders</dt>
          <dd className="mt-2 text-3xl font-semibold text-indigo-600">--</dd>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Pending Cashback</dt>
          <dd className="mt-2 text-3xl font-semibold text-indigo-600">$0.00</dd>
        </div>
        
        {/* Card 4 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Total Paid</dt>
          <dd className="mt-2 text-3xl font-semibold text-indigo-600">$0.00</dd>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <p>No recent activity found.</p>
        </div>
      </div>
    </div>
  );
}
