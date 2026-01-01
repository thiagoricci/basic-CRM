export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Updating deals...</span>
      </div>
    </div>
  );
}
