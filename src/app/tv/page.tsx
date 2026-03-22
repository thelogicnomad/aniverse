import CategoryPage from '@/components/ui/CategoryPage';
import { Tv } from 'lucide-react';

export default function TVPage() {
  return (
    <CategoryPage
      category="tv"
      title="TV Series"
      description="Ongoing and completed TV anime series"
      icon={<Tv className="w-7 h-7 text-accent" />}
    />
  );
}
