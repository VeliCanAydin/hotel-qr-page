import PageCard from '../../components/PageCard'
import { pages } from '../../lib/pages'
 
export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-8">
      <div className="grid grid-cols-2 gap-3 auto-rows-fr">
        {pages.map((page) => (
          <PageCard key={page.title} {...page} />
        ))}
      </div>
    </div>
  )
}
