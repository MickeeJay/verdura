import React from "react";

export default function VaultDetailLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 skeleton" />
        <div className="h-8 w-24 skeleton" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details and Progress */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 md:p-8 border border-border rounded-3xl space-y-6 bg-card">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-8 w-64 skeleton" />
                <div className="h-4 w-40 skeleton" />
              </div>
              <div className="h-6 w-20 skeleton rounded-full" />
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 skeleton" />
                <div className="h-4 w-24 skeleton" />
              </div>
              <div className="h-4 w-full skeleton rounded-full" />
            </div>

            {/* Detailed Grid Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <div className="h-4 w-24 skeleton" />
                <div className="h-6 w-32 skeleton" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 skeleton" />
                <div className="h-6 w-32 skeleton" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 skeleton" />
                <div className="h-5 w-28 skeleton" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 skeleton" />
                <div className="h-5 w-28 skeleton" />
              </div>
            </div>
          </div>

          {/* Transaction History Feed */}
          <div className="space-y-4">
            <div className="h-6 w-40 skeleton" />
            <div className="space-y-3">
              <div className="h-16 w-full skeleton rounded-xl" />
              <div className="h-16 w-full skeleton rounded-xl" />
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* WithdrawButton Skeleton */}
          <div className="h-12 w-full skeleton rounded-xl" />
          {/* DepositForm Skeleton */}
          <div className="h-64 w-full skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
