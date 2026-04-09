import api from './api';

export interface NewsItem {
  title: string;
  source: string;
  region: string;
  image: string | null;
  link: string | null;
}

const newsService = {
  async getNews(): Promise<NewsItem | null> {
    const res = await api.get('/news');
    return res.data.success ? res.data.data : null;
  },
};

export default newsService;
