function VoteBox({ votes, onUpvote, onDownvote }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-4">
      <button
        onClick={onUpvote}
        className="text-2xl font-bold text-slate-500 transition-colors duration-200 hover:text-indigo-600"
      >
        ▲
      </button>

      <span className="my-2 text-xl font-bold text-slate-900">{votes}</span>

      <button
        onClick={onDownvote}
        className="text-2xl font-bold text-slate-500 transition-colors duration-200 hover:text-indigo-600"
      >
        ▼
      </button>
    </div>
  );
}

export default VoteBox;
