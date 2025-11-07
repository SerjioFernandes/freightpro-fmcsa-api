import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../utils/constants';
import {
  Truck,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Settings,
  FileText,
  LayoutDashboard,
  Shield,
  ChevronDown,
  Bookmark,
  Package,
  Plus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  canViewLoadBoard,
  canPostLoad,
  canViewShipments
} from '../../utils/permissions';
import NotificationCenter from '../common/NotificationCenter';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [opsMenuOpen, setOpsMenuOpen] = useState(false);
  const [intelMenuOpen, setIntelMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const opsRef = useRef<HTMLDivElement | null>(null);
  const intelRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (opsRef.current && !opsRef.current.contains(event.target as Node)) {
        setOpsMenuOpen(false);
      }
      if (intelRef.current && !intelRef.current.contains(event.target as Node)) {
        setIntelMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine which nav items to show based on account type
  const showLoadBoard = isAuthenticated && canViewLoadBoard(user?.accountType);
  const showPostLoad = isAuthenticated && canPostLoad(user?.accountType);
  const showShipments = isAuthenticated && canViewShipments(user?.accountType);

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 sticky top-0 z-50 shadow-xl border-b border-blue-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2 group cursor-pointer">
            <Truck className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-white">CargoLume</span>
            <span className="px-3 py-1 bg-green-600/90 text-white text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-100"></span>
              </span>
              LIVE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 lg:flex">
            <Link
              to={ROUTES.HOME}
              className="text-white text-sm px-3 py-2 hover:bg-blue-700 rounded transition-colors flex items-center"
            >
              Home
            </Link>

            {isAuthenticated && (
              <Link
                to={ROUTES.DASHBOARD}
                className="text-white text-sm px-3 py-2 hover:bg-blue-700 rounded transition-colors flex items-center"
              >
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className="text-white text-sm px-4 py-2 hover:bg-red-700/80 rounded transition-colors flex items-center bg-red-600/90 border-2 border-red-500 shadow-lg shadow-red-900/50 font-bold"
              >
                <Shield className="w-4 h-4 mr-1" />
                Admin Console
              </Link>
            )}

            {isAuthenticated && (
              <div
                ref={opsRef}
                className="relative"
                onMouseEnter={() => setOpsMenuOpen(true)}
                onMouseLeave={() => setOpsMenuOpen(false)}
              >
                <button
                  type="button"
                  className={`text-white text-sm px-3 py-2 rounded transition-colors flex items-center ${
                    opsMenuOpen ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                  onClick={() => setOpsMenuOpen((prev) => !prev)}
                >
                  Operations
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${opsMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {opsMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 rounded-lg border border-blue-600 bg-blue-900/95 backdrop-blur-sm p-2 shadow-2xl">
                    {showLoadBoard && (
                      <Link
                        to={ROUTES.LOAD_BOARD}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-blue-700"
                        onClick={() => setOpsMenuOpen(false)}
                      >
                        <Truck className="h-4 w-4" />
                        Load Board
                      </Link>
                    )}
                    {showPostLoad && (
                      <Link
                        to={ROUTES.POST_LOAD}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-blue-700"
                        onClick={() => setOpsMenuOpen(false)}
                      >
                        <Plus className="h-4 w-4" />
                        Post Load
                      </Link>
                    )}
                    {showShipments && (
                      <Link
                        to={ROUTES.SHIPMENTS}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-blue-700"
                        onClick={() => setOpsMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        Shipments
                      </Link>
                    )}
                    <Link
                      to={ROUTES.DOCUMENTS}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-blue-700"
                      onClick={() => setOpsMenuOpen(false)}
                    >
                      <FileText className="h-4 w-4" />
                      Documents
                    </Link>
                    {showLoadBoard && (
                      <Link
                        to={ROUTES.SAVED_SEARCHES}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white hover:bg-blue-700"
                        onClick={() => setOpsMenuOpen(false)}
                      >
                        <Bookmark className="h-4 w-4" />
                        Saved Searches
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            <Link
              to={ROUTES.PRICING}
              className="text-white text-sm px-3 py-2 hover:bg-blue-700 rounded transition-colors flex items-center"
            >
              Pricing
            </Link>
          </nav>

          {/* Right Side: Auth Buttons */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <Link
                  to={ROUTES.MESSAGES}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 px-2 py-2 transition-colors relative"
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 px-2 py-2 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <div className="h-8 w-px bg-blue-700 mx-1"></div>
                <Link
                  to={ROUTES.PROFILE}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 px-3 py-2 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.company || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 px-3 py-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors flex items-center text-white"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-sm transition-colors flex items-center text-white"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white hover:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-blue-700 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={ROUTES.HOME}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  {showLoadBoard && (
                    <Link
                      to={ROUTES.LOAD_BOARD}
                      className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Load Board
                    </Link>
                  )}
                  {showPostLoad && (
                    <Link
                      to={ROUTES.POST_LOAD}
                      className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Post Load
                    </Link>
                  )}
                  {showShipments && (
                    <Link
                      to={ROUTES.SHIPMENTS}
                      className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shipments
                    </Link>
                  )}
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to={ROUTES.ADMIN_DASHBOARD}
                      className="text-white px-4 py-2 hover:bg-red-700 rounded transition-colors flex items-center gap-2 bg-red-600/40 border border-red-500/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Console
                    </Link>
                  )}
                  <Link
                    to={ROUTES.DOCUMENTS}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </Link>
                  {showLoadBoard && (
                    <Link
                      to={ROUTES.SAVED_SEARCHES}
                      className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Bookmark className="h-4 w-4" />
                      Saved Searches
                    </Link>
                  )}
                  <Link
                    to={ROUTES.MESSAGES}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </Link>
                  <Link
                    to={ROUTES.SETTINGS}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    to={ROUTES.PRICING}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-white px-4 py-2 hover:bg-red-700 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.HOME}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to={ROUTES.LOAD_BOARD}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Load Board
                  </Link>
                  <Link
                    to={ROUTES.PRICING}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-white px-4 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="text-white px-4 py-2 bg-green-700 hover:bg-green-600 rounded transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


