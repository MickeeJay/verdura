import React from "react";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 skeleton" />
          <div className="h-4 w-96 skeleton" />
        </div>
        <div className="h-10 w-24 skeleton" />
      </div>

      {/* Savings Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>

      {/* Grid for Streak and Leaderboard Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>

      {/* Vault Timeline Section */}
      <div className="border-t border-border pt-8 space-y-4">
        <div className="h-6 w-40 skeleton" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    </div>
  );
}
