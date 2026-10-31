import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Container from '../../components/common/Container.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import QuestionCard from '../../components/common/QuestionCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import * as questionService from '../../services/questionService.js';
import * as bookmarkService from '../../services/bookmarkService.js';
import * as notificationService from '../../services/notificationService.js';
import {
  HelpCircle,
  Bookmark,
  Bell,
  CheckCircle2,
  PlusCircle,
  Check,
} from 'lucide-react';

function StudentDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'bookmarks' | 'notifications'
  const [myQuestions, setMyQuestions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        const [qRes, bRes, nRes] = await Promise.all([
          questionService.getQuestions({ author: user._id, limit: 50 }),
          bookmarkService.getBookmarks({ limit: 50 }),
          notificationService.getNotifications({ limit: 50 }),
        ]);

        setMyQuestions(qRes.data.data.questions || []);
        setBookmarks(bRes.data.data.bookmarks || []);
        setNotifications(nRes.data.data.notifications || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const handleMarkAllNotifications = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const handleRemoveBookmark = async (questionId) => {
    try {
      await bookmarkService.removeBookmark(questionId);
      setBookmarks((prev) => prev.filter((q) => q._id !== questionId));
    } catch (_) {}
  };

  return (
    <Container className="py-8">
      {/* Student Profile Card */}
      <Card className="p-8 border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-2xl text-white shadow-md shadow-indigo-100">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user?.name}</h1>
                <Badge variant="student">Student</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-700">
                <span className="rounded bg-amber-50 px-2 py-0.5 border border-amber-200">
                  ★ {user?.reputation ?? 0} Reputation Points
                </span>
              </div>
            </div>
          </div>

          <Link to="/ask">
            <Button className="flex items-center gap-1.5 shadow-sm shadow-indigo-100">
              <PlusCircle className="h-4 w-4" />
              Ask New Doubt
            </Button>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-center">
          <div>
            <span className="text-2xl font-bold text-slate-900">{myQuestions.length}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Doubts Asked</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{bookmarks.length}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Saved Bookmarks</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">
              {notifications.filter((n) => !n.isRead).length}
            </span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Unread Alerts</span>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="mt-8 flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'questions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          My Doubts ({myQuestions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'bookmarks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Bookmarks ({bookmarks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="h-4 w-4" />
          Activity & Notifications
          {notifications.some((n) => !n.isRead) && (
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <LoadingSpinner text="Loading your dashboard..." />
        ) : (
          <>
            {/* My Questions Tab */}
            {activeTab === 'questions' && (
              <div>
                {myQuestions.length === 0 ? (
                  <EmptyState
                    title="You haven't asked any doubts yet"
                    description="Got stuck on a concept or assignment? Post a question and get answers from our community."
                    actionLabel="Ask Your First Doubt"
                    onAction={() => (window.location.href = '/ask')}
                  />
                ) : (
                  <div className="space-y-4">
                    {myQuestions.map((q) => (
                      <QuestionCard
                        key={q._id}
                        _id={q._id}
                        title={q.title}
                        description={q.description}
                        tags={q.tags}
                        voteScore={q.voteScore}
                        answerCount={q.answerCount}
                        author={q.author}
                        subject={q.subject}
                        hasVerifiedAnswer={q.hasVerifiedAnswer}
                        viewCount={q.viewCount}
                        createdAt={q.createdAt}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div>
                {bookmarks.length === 0 ? (
                  <EmptyState
                    icon={Bookmark}
                    title="No saved doubts"
                    description="When browsing questions, click the bookmark icon to save important discussions for later reference."
                    actionLabel="Browse Doubts"
                    onAction={() => (window.location.href = '/questions')}
                  />
                ) : (
                  <div className="space-y-4">
                    {bookmarks.map((q) => (
                      <QuestionCard
                        key={q._id}
                        _id={q._id}
                        title={q.title}
                        description={q.description}
                        tags={q.tags}
                        voteScore={q.voteScore}
                        answerCount={q.answerCount}
                        author={q.author}
                        subject={q.subject}
                        hasVerifiedAnswer={q.hasVerifiedAnswer}
                        viewCount={q.viewCount}
                        createdAt={q.createdAt}
                        isBookmarked={true}
                        onBookmarkToggle={() => handleRemoveBookmark(q._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-6 border border-slate-200/80 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                  {notifications.some((n) => !n.isRead) && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotifications}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">
                      No notifications yet. You will be notified when teachers and peers respond to your doubts.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`flex items-start justify-between p-4 transition rounded-xl ${
                          n.isRead ? 'bg-transparent text-slate-600' : 'bg-indigo-50/40 text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2
                            className={`mt-0.5 h-4 w-4 ${n.isRead ? 'text-slate-300' : 'text-indigo-600'}`}
                          />
                          <div>
                            <p className="text-sm">{n.message}</p>
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()} at{' '}
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {n.relatedId && n.relatedType === 'Question' && (
                          <Link
                            to={`/questions/${n.relatedId}`}
                            className="text-xs font-semibold text-indigo-600 hover:underline shrink-0 ml-4"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Container>
  );
}

export default StudentDashboard;
