import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  pendingInvitationsCount?: number;
  onNotificationClick?: () => void;
}

export function Layout({ children, pendingInvitationsCount = 0, onNotificationClick }: LayoutProps) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900">Bucket List</span>
          </Link>

          <div className="flex items-center gap-4">
            {onNotificationClick && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">🔔</span>
                {pendingInvitationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-white" />
                )}
              </button>
            )}

            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}>
                <Avatar name={user?.name || 'User'} src={user?.avatarUrl} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-[--radius] shadow-lg border border-gray-200 z-20">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
