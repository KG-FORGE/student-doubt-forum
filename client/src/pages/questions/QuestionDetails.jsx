import { useState } from "react";
import { useParams } from "react-router-dom";

import Container from "../../components/common/Container";
import Card from "../../components/common/Card";
import AnswerCard from "../../components/common/AnswerCard";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

import questions from "../../constants/questions";
import answers from "../../constants/answers";
import VoteBox from "../../components/common/VoteBox";

function QuestionDetails() {
  const { id } = useParams();

  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");

  const [questionData, setQuestionData] = useState(
    questions.find((question) => question.id === Number(id)),
  );

  const [questionAnswers, setQuestionAnswers] = useState(
    answers.filter((answer) => answer.questionId === Number(id)),
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

    const newAnswer = {
      id: Date.now(),
      questionId: Number(id),
      content: answer,
      author: "You",
      votes: 0,
    };

    setQuestionAnswers((prev) => [...prev, newAnswer]);

    setAnswer("");
  }

  function handleUpvoteQuestion() {
    setQuestionData((prev) => ({
      ...prev,
      votes: prev.votes + 1,
    }));
  }

  function handleDownvoteQuestion() {
    setQuestionData((prev) => ({
      ...prev,
      votes: prev.votes - 1,
    }));
  }

  function handleAnswerUpvote(answerId) {
    setQuestionAnswers((prev) =>
      prev.map((answer) =>
        answer.id === answerId
          ? { ...answer, votes: answer.votes + 1 }
          : answer,
      ),
    );
  }

  function handleAnswerDownvote(answerId) {
    setQuestionAnswers((prev) =>
      prev.map((answer) =>
        answer.id === answerId
          ? { ...answer, votes: answer.votes - 1 }
          : answer,
      ),
    );
  }

  if (!questionData) {
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
          {questionData.title}
        </h1>

        <div className="mt-6 flex items-center justify-between">
          <VoteBox
            votes={questionData.votes}
            onUpvote={handleUpvoteQuestion}
            onDownvote={handleDownvoteQuestion}
          />

          <p className="text-sm text-slate-600">
            Asked by{" "}
            <span className="font-medium text-slate-900">
              {questionData.author}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {questionData.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <hr className="my-6 border-slate-200" />

        <p className="leading-7 text-slate-700">{questionData.description}</p>
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
              onUpvote={() => handleAnswerUpvote(answer.id)}
              onDownvote={() => handleAnswerDownvote(answer.id)}
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
