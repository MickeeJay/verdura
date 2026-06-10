import React from "react";

export default function CreateVaultLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div>
        <div className="h-6 w-32 skeleton" />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-6 p-6 border border-border rounded-2xl bg-card">
          <div className="space-y-2">
            <div className="h-8 w-64 skeleton" />
            <div className="h-4 w-80 skeleton" />
          </div>

          {/* Form Fields Skeletons */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 skeleton" />
              <div className="h-10 w-full skeleton" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 skeleton" />
              <div className="h-10 w-full skeleton" />
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="space-y-2">
                <div className="h-4 w-28 skeleton" />
                <div className="h-3 w-48 skeleton" />
              </div>
              <div className="h-6 w-12 skeleton rounded-full" />
            </div>
          </div>

          <div className="h-10 w-full skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}
