import { useState } from "react";
import { Link } from "react-router-dom";

import Container from "../../components/common/Container";
import QuestionCard from "../../components/common/QuestionCard";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import questions from "../../constants/questions";

function Questions() {
  const [search, setSearch] = useState("");
  const filteredQuestions = questions.filter((question) => {
    const searchText = search.toLowerCase();

    return (
      question.title?.toLowerCase().includes(searchText) ||
      question.description?.toLowerCase().includes(searchText) ||
      question.tags?.some((tag) => tag?.toLowerCase().includes(searchText))
    );
  });

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Explore Questions
      </h1>

      <p className="mt-2 text-slate-600">
        Browse questions, share your knowledge, and learn from the community.
      </p>

      <div className="mt-8 flex items-end gap-4">
        <div className="flex-1">
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
          />
        </div>

        <Link to="/ask">
          <Button>Ask Question</Button>
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              title={question.title}
              description={question.description}
              tags={question.tags}
              votes={question.votes}
              answers={question.answers}
              author={question.author}
            />
          ))
        ) : (
          <p className="py-12 text-center text-slate-500">
            No questions found.
          </p>
        )}
      </div>
    </Container>
  );
}

export default Questions;
