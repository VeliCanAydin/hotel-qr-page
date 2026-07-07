// The route's params are only known at request time; this boundary lets the
// shell stream while the cached menu lookup runs.
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="h-9 w-56 animate-pulse rounded bg-muted" />
      <div className="h-10 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded bg-muted" />
    </div>
  )
}
