import { ChevronUp, ChevronDown } from 'lucide-react';

function VoteBox({ votes = 0, userVote = 0, onUpvote, onDownvote, orientation = 'vertical' }) {
  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;

  return (
    <div
      className={`flex items-center rounded-xl bg-slate-50 p-1 border border-slate-200/80 ${
        orientation === 'vertical' ? 'flex-col gap-1' : 'flex-row gap-2 px-2'
      }`}
    >
      <button
        type="button"
        onClick={onUpvote}
        aria-label="Upvote"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          isUpvoted
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-200/60 hover:text-indigo-600'
        }`}
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span
        className={`px-1 text-sm font-bold ${
          isUpvoted
            ? 'text-indigo-600'
            : isDownvoted
            ? 'text-rose-600'
            : 'text-slate-800'
        }`}
      >
        {votes}
      </span>

      <button
        type="button"
        onClick={onDownvote}
        aria-label="Downvote"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          isDownvoted
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-200/60 hover:text-rose-600'
        }`}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}

export default VoteBox;
