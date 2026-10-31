import Card from './Card';
import VoteBox from './VoteBox';
import Badge from './Badge';
import { CheckCircle2, ShieldCheck, Trash2, Flag } from 'lucide-react';

function AnswerCard({
  id,
  _id,
  content,
  author,
  votes = 0,
  voteScore,
  userVote = 0,
  isVerified = false,
  verifiedBy,
  createdAt,
  onUpvote,
  onDownvote,
  canVerify = false,
  onVerifyToggle,
  canDelete = false,
  onDelete,
  onReport,
}) {
  const answerId = _id || id;
  const finalVotes = voteScore !== undefined ? voteScore : votes;
  const authorName = typeof author === 'object' ? author?.name : author || 'Anonymous';
  const authorRole = typeof author === 'object' ? author?.role : null;
  const authorRep = typeof author === 'object' ? author?.reputation : null;
  const authorAvatar = typeof author === 'object' ? author?.avatarUrl : null;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Card
      className={`p-6 transition-all ${
        isVerified
          ? 'border-2 border-emerald-400 bg-emerald-50/20 shadow-sm'
          : 'border border-slate-200/80 bg-white'
      }`}
    >
      {isVerified && (
        <div className="mb-4 flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold">Teacher Verified Answer</span>
            {verifiedBy && (
              <span className="text-xs text-emerald-700">
                (verified by {typeof verifiedBy === 'object' ? verifiedBy.name : verifiedBy})
              </span>
            )}
          </div>
          {canVerify && (
            <button
              type="button"
              onClick={() => onVerifyToggle && onVerifyToggle(answerId)}
              className="text-xs font-medium text-emerald-700 hover:text-rose-600 hover:underline"
            >
              Unverify
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex shrink-0 items-start justify-center">
          <VoteBox
            votes={finalVotes}
            userVote={userVote}
            onUpvote={() => onUpvote && onUpvote(answerId)}
            onDownvote={() => onDownvote && onDownvote(answerId)}
          />
        </div>

        <div className="flex-1">
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {content}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={authorName} className="h-8 w-8 rounded-full" />
                ) : (
                  authorName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">{authorName}</span>
                  {authorRole && authorRole !== 'student' && (
                    <Badge variant={authorRole} className="text-[10px] py-0 px-1.5">
                      {authorRole}
                    </Badge>
                  )}
                  {authorRep !== null && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700">
                      ★ {authorRep}
                    </span>
                  )}
                </div>
                {formattedDate && <span className="text-slate-400">Answered on {formattedDate}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canVerify && !isVerified && (
                <button
                  type="button"
                  onClick={() => onVerifyToggle && onVerifyToggle(answerId)}
                  className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verify Answer
                </button>
              )}

              {onReport && (
                <button
                  type="button"
                  onClick={() => onReport(answerId)}
                  title="Report answer"
                  className="flex items-center gap-1 text-slate-400 hover:text-amber-600"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(answerId)}
                  title="Delete answer"
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AnswerCard;
