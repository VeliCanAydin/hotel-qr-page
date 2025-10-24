import PageCard from '../components/PageCard';
import { pages } from '../lib/pages';

export default function HomePage() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 auto-rows-fr">
      {pages.map((page) => (
        <PageCard key={page.title} {...page} />
      ))}
    </div>
  );
}
