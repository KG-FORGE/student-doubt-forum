import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import Container from '../../components/common/Container.jsx';
import QuestionCard from '../../components/common/QuestionCard.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import * as questionService from '../../services/questionService.js';
import * as subjectService from '../../services/subjectService.js';
import * as bookmarkService from '../../services/bookmarkService.js';
import { Search, PlusCircle, Filter } from 'lucide-react';

function Questions() {
  const { isAuthenticated } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const [search, setSearch] = useState('');
  const [activeSort, setActiveSort] = useState('newest'); // 'newest' | 'popular' | 'unanswered'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch subjects once
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await subjectService.getSubjects();
        setSubjects(res.data.data.subjects || []);
      } catch (_) {}
    }
    loadSubjects();
  }, []);

  // Fetch user bookmarks
  useEffect(() => {
    async function loadBookmarks() {
      if (!isAuthenticated) return;
      try {
        const res = await bookmarkService.getBookmarkedIds();
        setBookmarkedIds(new Set(res.data.data.bookmarkedIds || []));
      } catch (_) {}
    }
    loadBookmarks();
  }, [isAuthenticated]);

  // Load questions based on query params
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        sort: activeSort,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedSubject) params.subject = selectedSubject;

      const res = await questionService.getQuestions(params);
      const data = res.data.data;
      setQuestions(data.questions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalQuestions(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [page, activeSort, search, selectedSubject]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  const handleBookmarkToggle = async (questionId) => {
    if (!isAuthenticated) return;
    const isCurrentlyBookmarked = bookmarkedIds.has(questionId);

    // Optimistic UI update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    try {
      if (isCurrentlyBookmarked) {
        await bookmarkService.removeBookmark(questionId);
      } else {
        await bookmarkService.addBookmark(questionId);
      }
    } catch (_) {
      // Revert if failed
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.add(questionId);
        else next.delete(questionId);
        return next;
      });
    }
  };

  return (
    <Container className="py-8">
      {/* Header and Call to Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Explore Doubts & Questions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalQuestions > 0 ? `${totalQuestions} discussions` : 'Search, discuss, and learn together'}
          </p>
        </div>

        <Link to="/ask">
          <Button className="flex items-center gap-2 shadow-sm shadow-indigo-100">
            <PlusCircle className="h-4 w-4" />
            Ask a Doubt
          </Button>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Input
            name="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search keywords, topics, or #tags..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveSort('newest');
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 transition ${
                activeSort === 'newest'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSort('popular');
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 transition ${
                activeSort === 'popular'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Most Voted
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSort('unanswered');
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 transition ${
                activeSort === 'unanswered'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Unanswered
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="mt-8">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={fetchQuestions} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Fetching community doubts..." />
        ) : questions.length === 0 ? (
          <EmptyState
            title="No questions match your query"
            description="Try clearing your search filters or ask this question to get help from teachers and peers."
            actionLabel="Ask this Doubt"
            onAction={() => (window.location.href = '/ask')}
          />
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
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
                isBookmarked={bookmarkedIds.has(q._id)}
                onBookmarkToggle={isAuthenticated ? handleBookmarkToggle : undefined}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </Container>
  );
}

export default Questions;
