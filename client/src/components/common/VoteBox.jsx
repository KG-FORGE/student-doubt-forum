function VoteBox({ votes, onUpvote, onDownvote }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onUpvote}
        className="text-xl font-bold text-slate-500 transition hover:text-indigo-600"
      >
        ↑
      </button>

      <span className="text-base font-semibold text-slate-900">{votes}</span>

      <button
        onClick={onDownvote}
        className="text-xl font-bold text-slate-500 transition hover:text-indigo-600"
      >
        ↓
      </button>
    </div>
  );
}

export default VoteBox;
