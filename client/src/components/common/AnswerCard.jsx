import Card from "./Card";
import VoteBox from "./VoteBox";

function AnswerCard({ content, author, votes = 0, onUpvote, onDownvote }) {
  return (
    <Card className="p-6">
      <div className="flex gap-6">
        <VoteBox votes={votes} onUpvote={onUpvote} onDownvote={onDownvote} />

        <div className="flex-1">
          <p className="leading-7 text-slate-700">{content}</p>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">Answered by</p>

            <p className="font-medium text-slate-800">{author}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AnswerCard;
