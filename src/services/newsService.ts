import api from './api';

export interface NewsItem {
  title: string;
  source: string;
  region: string;
  image: string | null;
  link: string | null;
}

let _cache: { item: NewsItem | null; ts: number } | null = null;
const CACHE_TTL = 30_000;

const newsService = {
  async getNews(): Promise<NewsItem | null> {
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.item;
    const res = await api.get<NewsItem>('/news');
    const item = res.success ? res.data : null;
    _cache = { item, ts: Date.now() };
    return item;
  },
};

export default newsService;
