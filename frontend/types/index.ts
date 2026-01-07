export type CardStatus = 'PARSING_PENDING' | 'DISPLAY_READY' | 'PARSING_FAILED';

export interface CardData {
  id: string;
  url: string;
  status: CardStatus;
  timestamp: string;
  title?: string;
  author?: string;
  summary?: string[];
  thumbnailUrl?: string;
  metadata?: string;
}
