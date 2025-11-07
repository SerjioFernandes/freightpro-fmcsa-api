import { useLocation, useNavigate } from 'react-router-dom';
import { Package, MessageSquare, User, LayoutDashboard, Bookmark } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.DASHBOARD },
    { icon: Package, label: 'Loads', path: ROUTES.LOAD_BOARD },
    { icon: Bookmark, label: 'Searches', path: ROUTES.SAVED_SEARCHES },
    { icon: MessageSquare, label: 'Messages', path: ROUTES.MESSAGES },
    { icon: User, label: 'Profile', path: ROUTES.PROFILE }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-between px-2.5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 min-w-[52px] transition-all ${
                active
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 transition-transform ${active ? 'scale-110' : 'scale-100'}`} />
              <span className="text-[11px] leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

