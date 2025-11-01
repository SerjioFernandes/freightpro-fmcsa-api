import { useLocation, useNavigate } from 'react-router-dom';
import { Package, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.DASHBOARD },
    { icon: Package, label: 'Loads', path: ROUTES.LOAD_BOARD },
    { icon: MessageSquare, label: 'Messages', path: ROUTES.MESSAGES },
    { icon: User, label: 'Profile', path: ROUTES.PROFILE }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
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

