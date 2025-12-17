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
    <div className="min-h-screen">
      {/* Glass Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-2xl group-hover:animate-wiggle transition-transform">🎯</span>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Bucket List
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {onNotificationClick && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 rounded-[--radius] hover:bg-gray-100 transition-all hover:scale-105"
              >
                <span className="text-xl">🔔</span>
                {pendingInvitationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-gradient-to-r from-pink-500 to-danger-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="hover:scale-105 transition-transform"
              >
                <Avatar name={user?.name || 'User'} src={user?.avatarUrl} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-[--radius-lg] shadow-soft-lg border border-gray-100 z-20 animate-scale-in origin-top-right overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pastel-pink/30 to-pastel-purple/30">
                      <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
