import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">
      <main className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
          PrePay OMS
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          E-commerce Buyer Profile & Cashback Management System
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/login"
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-600/30"
          >
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="/register"
            className="px-8 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 border border-indigo-100 transition-all shadow-sm"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
