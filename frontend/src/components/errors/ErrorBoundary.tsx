"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React class component error boundary that catches render errors in its subtree
 * and displays a friendly error card with a 'Try Again' button.
 *
 * React error boundaries must be class components — this is a React limitation.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex items-center justify-center min-h-[300px] px-4"
          data-testid="error-boundary-fallback"
        >
          <div className="w-full max-w-md p-8 bg-card border border-destructive/30 rounded-2xl shadow-xl text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An unexpected error occurred while rendering this section. Please try again or
                refresh the page.
              </p>
              {this.state.error && (
                <p className="text-xs text-destructive/70 font-mono mt-2 break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              data-testid="error-boundary-retry"
            >
              <RotateCcw className="size-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
