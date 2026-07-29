import { Link } from "react-router-dom";
import Card from "./Card";

function QuestionCard({
  id,
  title,
  description,
  tags = [],
  votes = 0,
  answers = 0,
  author,
}) {
  const safeDescription = description || "";

  const preview =
    safeDescription.length > 140
      ? safeDescription.slice(0, 140) + "..."
      : safeDescription;

  return (
    <Link to={`/questions/${id}`} className="block">
      <Card
        hoverable
        className="group border border-slate-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
      >
        <h2 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
          {title}
        </h2>

        <p className="mt-3 leading-7 text-slate-600">{preview}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-emerald-600">▲</span>

            <span className="font-semibold text-slate-800">{votes}</span>
          </div>

          <div className="flex items-center gap-5">
            <span>💬 {answers} Answers</span>

            <span>
              Asked by{" "}
              <span className="font-medium text-slate-800">{author}</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default QuestionCard;
