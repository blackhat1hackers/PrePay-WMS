"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User as UserIcon, Menu } from "lucide-react";

export default function TopNav({ setSidebarOpen }: { setSidebarOpen?: (v: boolean) => void }) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200">
      <button
        type="button"
        onClick={() => setSidebarOpen?.(true)}
        className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
        <div className="flex-1 flex">
          {/* We can add global search here later */}
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <div className="flex items-center text-sm font-medium text-slate-700">
            <UserIcon className="h-5 w-5 mr-2 text-slate-400" />
            <span>{session?.user?.name || session?.user?.email}</span>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {session?.user?.role || 'User'}
            </span>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
