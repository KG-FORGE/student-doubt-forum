import { Link } from 'react-router';
import Card from './Card';
import Badge from './Badge';
import { CheckCircle2, MessageSquare, ThumbsUp, Eye, Bookmark } from 'lucide-react';

function QuestionCard({
  id,
  _id,
  title,
  description,
  tags = [],
  votes = 0,
  voteScore,
  answers = 0,
  answerCount,
  author,
  subject,
  hasVerifiedAnswer,
  viewCount = 0,
  createdAt,
  isBookmarked = false,
  onBookmarkToggle,
}) {
  const questionId = _id || id;
  const safeDescription = description || '';
  const finalVotes = voteScore !== undefined ? voteScore : votes;
  const finalAnswers = answerCount !== undefined ? answerCount : answers;

  const authorName = typeof author === 'object' ? author?.name : author || 'Anonymous';
  const authorRole = typeof author === 'object' ? author?.role : null;
  const authorRep = typeof author === 'object' ? author?.reputation : null;
  const subjectName = typeof subject === 'object' ? subject?.name : subject;

  const preview =
    safeDescription.length > 140
      ? safeDescription.slice(0, 140) + '...'
      : safeDescription;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Card
      hoverable
      className="group relative border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {hasVerifiedAnswer && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3" />
              Verified Answer
            </Badge>
          )}
          {subjectName && (
            <Badge variant="primary">{subjectName}</Badge>
          )}
        </div>

        {onBookmarkToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(questionId);
            }}
            aria-label="Bookmark doubt"
            className={`rounded-lg p-1.5 transition ${
              isBookmarked
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <Link to={`/questions/${questionId}`} className="block">
        <h2 className="mt-3 text-lg font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">{preview}</p>

        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <ThumbsUp className="h-3.5 w-3.5 text-indigo-600" />
            {finalVotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            {finalAnswers} {finalAnswers === 1 ? 'answer' : 'answers'}
          </span>
          {viewCount !== undefined && (
            <span className="hidden items-center gap-1 sm:flex">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              {viewCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Asked by <strong className="text-slate-800">{authorName}</strong></span>
          {authorRole && authorRole !== 'student' && (
            <Badge variant={authorRole} className="text-[10px] py-0 px-1.5">
              {authorRole}
            </Badge>
          )}
          {authorRep !== null && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              ★ {authorRep}
            </span>
          )}
          {formattedDate && <span className="text-slate-400">• {formattedDate}</span>}
        </div>
      </div>
    </Card>
  );
}

export default QuestionCard;
