// src/components/auth/AuthGuard.jsx
import { useCurrentUser } from '../../hooks/useCurrentUser';
import AuthRequiredModal from './AuthRequiredModal';

export default function AuthGuard({ children }) {
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  if (isLoading) return <div>로딩 중...</div>;
  if (isError && error.status === 401) {
    return <AuthRequiredModal isOpen={true} onClose={() => {}} />;
  }
  
  return children;
}