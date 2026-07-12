import { useState } from "react";

import Container from "../../components/common/Container";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

function AskQuestion() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.tags.trim()) {
      newErrors.tags = "At least one tag is required";
    }

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    console.log(formData);
  }

  return (
    <Container className="py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Ask a Question
          </h1>

          <p className="mt-2 text-slate-600">
            Describe your doubt clearly so the community can help you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your question?"
              error={errors.title}
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain your question in detail..."
              error={errors.description}
            />

            <Input
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, JavaScript, DSA"
              error={errors.tags}
            />

            <Button type="submit">Post Question</Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}

export default AskQuestion;
