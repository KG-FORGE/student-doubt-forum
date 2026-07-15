import Card from "./Card";

function AnswerCard({ content, author, votes = 0 }) {
  return (
    <Card className="p-6">
      <p className="text-slate-700">{content}</p>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>{votes} votes</span>
        <span>Answered by {author}</span>
      </div>
    </Card>
  );
}

export default AnswerCard;
