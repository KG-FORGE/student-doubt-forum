import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Container from '../../components/common/Container.jsx';
import Card from '../../components/common/Card.jsx';
import AnswerCard from '../../components/common/AnswerCard.jsx';
import Textarea from '../../components/common/Textarea.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import VoteBox from '../../components/common/VoteBox.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import * as questionService from '../../services/questionService.js';
import * as answerService from '../../services/answerService.js';
import * as voteService from '../../services/voteService.js';
import * as bookmarkService from '../../services/bookmarkService.js';
import * as reportService from '../../services/reportService.js';
import {
  CheckCircle2,
  Bookmark,
  Flag,
  Trash2,
  Eye,
  MessageSquare,
  Lock,
  Unlock,
  AlertCircle,
  X,
} from 'lucide-react';

function QuestionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isTeacher } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [userVotes, setUserVotes] = useState({}); // { [targetId]: 1 | -1 }
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Answer form
  const [answerContent, setAnswerContent] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Report Modal
  const [reportTarget, setReportTarget] = useState(null); // { type: 'Question' | 'Answer', id: string }
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState(null); // 'success' | error string

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [qRes, aRes] = await Promise.all([
        questionService.getQuestionById(id),
        answerService.getAnswersForQuestion(id),
      ]);

      const qData = qRes.data.data.question;
      const aData = aRes.data.data.answers;

      setQuestion(qData);
      setAnswers(aData);

      // If user is authenticated, fetch their votes and bookmark state
      if (isAuthenticated) {
        const targetIds = [qData._id, ...aData.map((a) => a._id)];
        const [votesRes, bookmarksRes] = await Promise.all([
          voteService.getUserVotes(targetIds),
          bookmarkService.getBookmarkedIds(),
        ]);

        setUserVotes(votesRes.data.data.votes || {});
        const bIds = bookmarksRes.data.data.bookmarkedIds || [];
        setIsBookmarked(bIds.includes(qData._id));
      }
    } catch (err) {
      setPageError(
        err.response?.status === 404
          ? 'This question does not exist or has been removed.'
          : err.response?.data?.message || 'Failed to load doubt details.',
      );
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Vote handler
  const handleVote = async (targetType, targetId, value) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Security check on client
    if (targetType === 'Question' && question.author?._id === user?._id) {
      alert('You cannot vote on your own doubt.');
      return;
    }

    try {
      const res = await voteService.castVote(targetType, targetId, value);
      const { voteScore: newScore, userVote: newUserVote } = res.data.data;

      // Update vote record
      setUserVotes((prev) => ({ ...prev, [targetId]: newUserVote }));

      if (targetType === 'Question') {
        setQuestion((prev) => ({ ...prev, voteScore: newScore }));
      } else {
        setAnswers((prev) =>
          prev.map((a) => (a._id === targetId ? { ...a, voteScore: newScore } : a)),
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Vote failed');
    }
  };

  // Bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      if (nextState) {
        await bookmarkService.addBookmark(question._id);
      } else {
        await bookmarkService.removeBookmark(question._id);
      }
    } catch (_) {
      setIsBookmarked(!nextState);
    }
  };

  // Answer submission
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (answerContent.trim().length < 20) {
      setAnswerError('Answer must be at least 20 characters long.');
      return;
    }
    setAnswerError('');
    setSubmittingAnswer(true);

    try {
      const res = await answerService.createAnswer(question._id, answerContent.trim());
      const newAnswer = res.data.data.answer;
      setAnswers((prev) => [...prev, newAnswer]);
      setQuestion((prev) => ({ ...prev, answerCount: (prev.answerCount || 0) + 1 }));
      setAnswerContent('');
    } catch (err) {
      setAnswerError(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Verification toggle (Teacher or Admin)
  const handleVerifyAnswer = async (answerId) => {
    try {
      const res = await answerService.toggleVerifyAnswer(answerId);
      const updatedAnswer = res.data.data.answer;

      setAnswers((prev) => {
        const nextList = prev.map((a) => (a._id === answerId ? updatedAnswer : a));
        // Keep verified answers sorted to the top
        return nextList.sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0));
      });

      // Update question hasVerifiedAnswer
      const anyVerified = answers.some((a) => (a._id === answerId ? updatedAnswer.isVerified : a.isVerified));
      setQuestion((prev) => ({ ...prev, hasVerifiedAnswer: anyVerified }));
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  // Delete answer
  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await answerService.deleteAnswer(answerId);
      setAnswers((prev) => prev.filter((a) => a._id !== answerId));
      setQuestion((prev) => ({ ...prev, answerCount: Math.max(0, (prev.answerCount || 1) - 1) }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete answer.');
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this doubt?')) return;
    try {
      await questionService.deleteQuestion(question._id);
      navigate('/questions');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  // Toggle question status (open/closed)
  const handleToggleStatus = async () => {
    try {
      const res = await questionService.toggleQuestionStatus(question._id);
      setQuestion((prev) => ({ ...prev, status: res.data.data.status }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update question status.');
    }
  };

  // Report submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportTarget) return;

    setReportSubmitting(true);
    setReportStatus(null);
    try {
      await reportService.createReport({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reason: reportReason,
        description: reportDescription.trim(),
      });
      setReportStatus('success');
      setTimeout(() => {
        setReportTarget(null);
        setReportStatus(null);
        setReportDescription('');
      }, 2000);
    } catch (err) {
      setReportStatus(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-16">
        <LoadingSpinner text="Loading doubt details..." />
      </Container>
    );
  }

  if (pageError || !question) {
    return (
      <Container className="py-16">
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Doubt Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">{pageError || 'This doubt is not available.'}</p>
          <div className="mt-6">
            <Link to="/questions">
              <Button>Explore Other Doubts</Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  const isOwner = user && question.author?._id === user._id;
  const canManageQuestion = isOwner || isAdmin;
  const canVerifyAnswers = isTeacher || isAdmin;

  return (
    <Container className="py-8">
      {/* Question Header Card */}
      <Card className="p-8 border border-slate-200/90 shadow-sm bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {question.hasVerifiedAnswer && (
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Solution
              </Badge>
            )}
            {question.subject?.name && (
              <Badge variant="primary">{question.subject.name}</Badge>
            )}
            {question.status === 'closed' && (
              <Badge variant="warning">
                <Lock className="h-3 w-3" />
                Closed
              </Badge>
            )}
          </div>

          {/* Action buttons (Bookmark, Report, Owner tools) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark doubt'}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setReportTarget({ type: 'Question', id: question._id })}
                title="Report doubt"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-amber-600"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            )}

            {canManageQuestion && (
              <>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  title={question.status === 'open' ? 'Close doubt' : 'Reopen doubt'}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {question.status === 'open' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  {question.status === 'open' ? 'Close' : 'Reopen'}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteQuestion}
                  title="Delete doubt"
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {question.title}
        </h1>

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>
            Asked by <strong className="text-slate-800">{question.author?.name || 'Anonymous'}</strong>
          </span>
          {question.author?.role && question.author.role !== 'student' && (
            <Badge variant={question.author.role} className="text-[10px] py-0 px-1.5">
              {question.author.role}
            </Badge>
          )}
          {question.author?.reputation !== undefined && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              ★ {question.author.reputation} pts
            </span>
          )}
          <span>• {new Date(question.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {question.viewCount || 0} views
          </span>
        </div>

        {/* Question Body + Voting */}
        <div className="mt-6 flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            <VoteBox
              votes={question.voteScore || 0}
              userVote={userVotes[question._id] || 0}
              onUpvote={() => handleVote('Question', question._id, 1)}
              onDownvote={() => handleVote('Question', question._id, -1)}
            />
          </div>

          <div className="flex-1">
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm whitespace-pre-line">
              {question.description}
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Answers Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {answers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
              No answers posted yet. Be the first to share an explanation!
            </div>
          ) : (
            answers.map((ans) => (
              <AnswerCard
                key={ans._id}
                _id={ans._id}
                content={ans.content}
                author={ans.author}
                voteScore={ans.voteScore}
                userVote={userVotes[ans._id] || 0}
                isVerified={ans.isVerified}
                verifiedBy={ans.verifiedBy}
                createdAt={ans.createdAt}
                onUpvote={() => handleVote('Answer', ans._id, 1)}
                onDownvote={() => handleVote('Answer', ans._id, -1)}
                canVerify={canVerifyAnswers}
                onVerifyToggle={handleVerifyAnswer}
                canDelete={isAdmin || (user && ans.author?._id === user._id)}
                onDelete={handleDeleteAnswer}
                onReport={() => setReportTarget({ type: 'Answer', id: ans._id })}
              />
            ))
          )}
        </div>
      </div>

      {/* Write Answer Form */}
      <Card className="mt-10 p-8 border border-slate-200 shadow-sm bg-white">
        <h3 className="text-xl font-bold text-slate-900">Your Answer</h3>
        <p className="mt-1 text-xs text-slate-500">
          Provide step-by-step reasoning, examples, and sources to help the student learn.
        </p>

        {question.status === 'closed' ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            🔒 This question has been marked as closed and is not accepting further answers.
          </div>
        ) : !isAuthenticated ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-700">You must be signed in to submit an answer.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/login">
                <Button variant="secondary" className="text-xs">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="text-xs">Create Account</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAnswerSubmit} className="mt-6 space-y-4">
            {answerError && <ErrorMessage message={answerError} />}

            <Textarea
              name="answerContent"
              rows={5}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Write your explanation or code solution here (minimum 20 characters)..."
            />

            <Button type="submit" disabled={submittingAnswer}>
              {submittingAnswer ? 'Posting answer...' : 'Submit Answer'}
            </Button>
          </form>
        )}
      </Card>

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag className="h-4 w-4 text-rose-600" />
                Report {reportTarget.type}
              </h4>
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportStatus === 'success' ? (
              <div className="py-6 text-center text-emerald-700">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Report Submitted</p>
                <p className="text-xs text-slate-500 mt-1">Thank you for helping keep our forum safe.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                {reportStatus && typeof reportStatus === 'string' && (
                  <ErrorMessage message={reportStatus} />
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="spam">Spam or unwanted advertisement</option>
                    <option value="offensive">Offensive, abusive, or inappropriate language</option>
                    <option value="misleading">Incorrect or misleading information</option>
                    <option value="plagiarism">Plagiarism / copy-paste without attribution</option>
                    <option value="off-topic">Off-topic content</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide additional details for the moderation team..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={reportSubmitting} className="text-xs">
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}

export default QuestionDetails;
