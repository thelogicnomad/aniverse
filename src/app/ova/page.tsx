import CategoryPage from '@/components/ui/CategoryPage';
import { Star } from 'lucide-react';

export default function OVAPage() {
  return (
    <CategoryPage
      category="ova"
      title="OVA"
      description="Original Video Animations"
      icon={<Star className="w-7 h-7 text-yellow-500" />}
    />
  );
}
