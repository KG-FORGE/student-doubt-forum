import { useState } from "react";
import { useParams } from "react-router-dom";

import Container from "../../components/common/Container";
import Card from "../../components/common/Card";
import AnswerCard from "../../components/common/AnswerCard";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

import questions from "../../constants/questions";
import answers from "../../constants/answers";

function QuestionDetails() {
  const { id } = useParams();

  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");

  const question = questions.find((question) => question.id === Number(id));

  const questionAnswers = answers.filter(
    (answer) => answer.questionId === Number(id),
  );

  function handleAnswerSubmit(e) {
    e.preventDefault();

    if (!answer.trim()) {
      setAnswerError("Answer is required");
      return;
    }

    if (answer.trim().length < 20) {
      setAnswerError("Answer must be at least 20 characters");
      return;
    }

    setAnswerError("");

    console.log({
      questionId: Number(id),
      content: answer,
    });
  }

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

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">
          {questionAnswers.length} Answers
        </h2>

        <div className="mt-6 space-y-4">
          {questionAnswers.map((answer) => (
            <AnswerCard
              key={answer.id}
              content={answer.content}
              author={answer.author}
              votes={answer.votes}
            />
          ))}
        </div>
      </div>

      <Card className="mt-10 p-8">
        <h2 className="text-2xl font-bold text-slate-900">Write Your Answer</h2>

        <form onSubmit={handleAnswerSubmit} className="mt-6 space-y-6">
          <Textarea
            name="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Explain your answer clearly..."
            error={answerError}
          />

          <Button type="submit">Post Answer</Button>
        </form>
      </Card>
    </Container>
  );
}

export default QuestionDetails;
