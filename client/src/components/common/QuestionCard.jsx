import Card from "./Card";

function QuestionCard({
  title,
  description,
  tags = [],
  votes = 0,
  answers = 0,
  author,
}) {
  return (
    <Card hoverable className="p-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

      <p className="mt-2 text-slate-600">{description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg bg-indigo-50 px-2 py-1 text-sm text-indigo-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <div className="flex gap-4">
          <span>{votes} votes</span>
          <span>{answers} answers</span>
        </div>

        <span>{author}</span>
      </div>
    </Card>
  );
}

export default QuestionCard;
