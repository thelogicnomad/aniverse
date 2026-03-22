import CategoryPage from '@/components/ui/CategoryPage';
import { Film } from 'lucide-react';

export default function MoviesPage() {
  return (
    <CategoryPage
      category="movie"
      title="Anime Movies"
      description="Feature-length anime films"
      icon={<Film className="w-7 h-7 text-primary" />}
    />
  );
}
