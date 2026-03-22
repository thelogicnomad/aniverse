import CategoryPage from '@/components/ui/CategoryPage';
import { Play } from 'lucide-react';

export default function ONAPage() {
  return (
    <CategoryPage
      category="ona"
      title="ONA"
      description="Original Net Animations — released online"
      icon={<Play className="w-7 h-7 text-purple-400" />}
    />
  );
}
