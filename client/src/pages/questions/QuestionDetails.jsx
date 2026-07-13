import { useParams } from "react-router-dom";

import Container from "../../components/common/Container";
import Card from "../../components/common/Card";
import questions from "../../constants/questions";

function QuestionDetails() {
  const { id } = useParams();

  const question = questions.find((question) => question.id === Number(id));

  if (!question) {
    return (
      <Container className="py-8">
        <p className="text-slate-600">Question not found.</p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {question.title}
        </h1>

        <p className="mt-4 text-slate-600">{question.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-indigo-50 px-2 py-1 text-sm text-indigo-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
          <span>{question.votes} votes</span>
          <span>Asked by {question.author}</span>
        </div>
      </Card>
    </Container>
  );
}

export default QuestionDetails;
