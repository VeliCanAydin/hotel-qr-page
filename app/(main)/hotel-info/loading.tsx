// The page reads the guest session (Wi-Fi gate), so it renders at request
// time; this boundary lets the shell stream while the session check runs.
export default function Loading() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="h-[42vh] min-h-80 animate-pulse bg-muted" />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
