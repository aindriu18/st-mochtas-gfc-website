import AdminArchiveManager from './AdminArchiveManager';
import AdminContentManager from './AdminContentManager';
import type { NewsCardItem } from '../../lib/club-news';

export default function AdminWorkspace({ latestNews }: { latestNews: NewsCardItem[] }) {
  return <AdminContentManager latestNews={latestNews} archiveManager={<AdminArchiveManager />} />;
}
