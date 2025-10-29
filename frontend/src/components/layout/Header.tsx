import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../utils/constants';
import { Truck, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMobileMenuOpen(false);
  };

  return (
    <header className="glass-dark sticky top-0 z-50 border-b border-emerald-whisper/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
            <Truck className="h-10 w-10 text-saffron-gold transition-transform group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="text-2xl font-heading font-bold text-saffron-gold">CargoLume</span>
              <span className="text-xs text-emerald-whisper font-accent uppercase tracking-wider">Premium Freight</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-saffron-gold hover:after:w-full after:transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to={ROUTES.LOAD_BOARD}
                  className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-saffron-gold hover:after:w-full after:transition-all"
                >
                  Load Board
                </Link>
                <Link
                  to={ROUTES.PRICING}
                  className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-saffron-gold hover:after:w-full after:transition-all"
                >
                  Pricing
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  className="flex items-center space-x-2 text-soft-ivory hover:text-emerald-whisper font-body font-medium transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.company || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-soft-ivory hover:text-red-400 font-body font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.PRICING}
                  className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                >
                  Login
                </Link>
                <Button variant="accent" size="md">
                  <Link to={ROUTES.REGISTER}>Get Started</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-soft-ivory hover:text-saffron-gold transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-whisper/20 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={ROUTES.LOAD_BOARD}
                    className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Load Board
                  </Link>
                  <Link
                    to={ROUTES.PRICING}
                    className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-soft-ivory hover:text-red-400 font-body font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.PRICING}
                    className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-soft-ivory hover:text-saffron-gold font-body font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="btn btn-accent w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
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


