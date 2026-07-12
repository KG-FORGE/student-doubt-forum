import { useState } from "react";
import { Link } from "react-router-dom";

import Container from "../../components/common/Container";
import QuestionCard from "../../components/common/QuestionCard";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

function Questions() {
  const [search, setSearch] = useState("");

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
        <QuestionCard
          title="How does binary search work?"
          description="I am confused about how the mid calculation works in binary search."
          tags={["C++", "DSA"]}
          votes={12}
          answers={5}
          author="Kartik"
        />

        <QuestionCard
          title="What is useState in React?"
          description="Can someone explain useState and controlled inputs in simple language?"
          tags={["React", "JavaScript"]}
          votes={8}
          answers={3}
          author="Gifty"
        />
      </div>
    </Container>
  );
}

export default Questions;
