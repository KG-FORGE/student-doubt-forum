import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import * as notificationService from '../../services/notificationService.js';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import {
  Bell,
  HelpCircle,
  PlusCircle,
  LogOut,
  User,
  Shield,
  GraduationCap,
  Bookmark,
  Check,
  Menu,
  X,
} from 'lucide-react';

function Navbar() {
  const { user, isAuthenticated, role, isAdmin, isTeacher, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Fetch unread notifications count when user is authenticated
  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.data.unreadCount);
    } catch (_) {}
  };

  const fetchNotificationList = async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 5 });
      setNotifications(res.data.data.notifications);
    } catch (_) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleToggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      await fetchNotificationList();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isTeacher) return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-200">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span>Doubt<span className="text-indigo-600">Forum</span></span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-1">
            <Link
              to="/questions"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                location.pathname === '/questions'
                  ? 'bg-slate-100 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              All Doubts
            </Link>

            {isAuthenticated && (
              <>
                {isStudent && (
                  <Link
                    to="/student/dashboard"
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      location.pathname.startsWith('/student')
                        ? 'bg-slate-100 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    My Doubts
                  </Link>
                )}

                {isTeacher && (
                  <Link
                    to="/teacher/dashboard"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      location.pathname.startsWith('/teacher')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                    Teacher Portal
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="h-4 w-4 text-rose-600" />
                    Admin Console
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {isAuthenticated ? (
            <>
              {/* Ask Doubt CTA Button */}
              <Link to="/ask">
                <Button className="flex items-center gap-1.5 shadow-sm shadow-indigo-100">
                  <PlusCircle className="h-4 w-4" />
                  Ask Doubt
                </Button>
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  aria-label="Notifications"
                  className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="mt-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400">No recent notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-2.5 rounded-lg text-xs transition ${
                              n.isRead ? 'text-slate-600' : 'bg-indigo-50/50 text-slate-900 font-medium'
                            }`}
                          >
                            <p>{n.message}</p>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                      <Link
                        to={isStudent ? '/student/dashboard' : '/questions'}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all activity
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-left transition hover:bg-slate-100"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-xs text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role} • ★ {user?.reputation ?? 0}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge variant={role} className="text-[10px]">{role}</Badge>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          ★ {user?.reputation ?? 0} pts
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      <Link
                        to={getDashboardPath()}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" className="text-sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button className="text-sm shadow-sm shadow-indigo-100">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link to="/ask" className="p-2 text-indigo-600">
              <PlusCircle className="h-6 w-6" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            <Link
              to="/questions"
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              All Doubts
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard ({role})
                </Link>
                <Link
                  to="/ask"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-indigo-600 bg-indigo-50"
                >
                  + Ask a Doubt
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left rounded-lg px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-slate-100">
                <Link to="/login" className="w-full">
                  <Button variant="secondary" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
