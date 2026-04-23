// Legacy route: /site-detail/:id — forwards to the canonical tour detail page.
import { Navigate, useParams } from 'react-router-dom';

const SiteDetailPage = () => {
  const { id } = useParams();
  if (!id) return <Navigate to="/visit-taxila" replace />;
  return <Navigate to={`/tour/${encodeURIComponent(id)}`} replace />;
};

export default SiteDetailPage;
