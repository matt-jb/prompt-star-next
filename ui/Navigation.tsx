"use client";

import { signOut } from "@/lib/actions/auth-actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Session = typeof auth.$Infer.Session;

export default function Navigation({ session }: { session: Session | null }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/40">
              <svg
                className="w-6 h-6 text-white drop-shadow-sm"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              Prompt Star
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/add"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/add")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Add Prompt
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/login")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
