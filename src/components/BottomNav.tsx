"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Don't show on login page
  if (pathname === "/login") return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe pt-2 px-6 flex justify-around items-center z-50 md:hidden pb-5">
      <Link
        href="/"
        prefetch={false}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/") ? "text-[#ff758c]" : "text-gray-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isActive("/") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className="text-xs font-medium">我们的家</span>
      </Link>

      <Link
        href="/map"
        prefetch={false}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/map") ? "text-[#ff758c]" : "text-gray-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isActive("/map") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="10" r="3" />
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
        </svg>
        <span className="text-xs font-medium">足迹地图</span>
      </Link>

      <Link
        href="/order"
        prefetch={false}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/order") ? "text-[#ff758c]" : "text-gray-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <span className="text-xs font-medium">恋爱餐厅</span>
      </Link>

      <Link
        href="/wishlist"
        prefetch={false}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/wishlist") ? "text-[#ff758c]" : "text-gray-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isActive("/wishlist") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span className="text-xs font-medium">愿望清单</span>
      </Link>
      
      {/* Secret Admin Entry (Long Press or just invisible but clickable area could be risky, let's make it a tiny dot) */}
      <Link href="/admin" className="absolute top-0 right-0 w-4 h-4 opacity-0" aria-hidden="true" />
    </div>
  );
}
