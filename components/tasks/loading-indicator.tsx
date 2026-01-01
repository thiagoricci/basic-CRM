'use client';

export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      <span>Updating tasks...</span>
    </div>
  );
}
