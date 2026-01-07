import { CardData } from '@/types';
import ContentCard from './ContentCard';

interface Props {
  cards: CardData[];
  onRetry: (id: string, url: string) => void;
}

export default function ResultFeed({ cards, onRetry }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {cards.map((card) => (
        <ContentCard key={card.id} data={card} onRetry={onRetry} />
      ))}
    </div>
  );
}
