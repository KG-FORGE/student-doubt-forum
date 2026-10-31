import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Container from '../../components/common/Container.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Textarea from '../../components/common/Textarea.jsx';
import Button from '../../components/common/Button.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import * as questionService from '../../services/questionService.js';
import * as subjectService from '../../services/subjectService.js';
import { HelpCircle, Sparkles } from 'lucide-react';

function AskQuestion() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    subject: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await subjectService.getSubjects();
        setSubjects(res.data.data.subjects || []);
      } catch (_) {}
    }
    loadSubjects();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 300) {
      newErrors.title = 'Title must be at most 300 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.tags.trim()) {
      newErrors.tags = 'Provide at least one tag';
    } else {
      const tagList = formData.tags
        .split(/[, ]+/)
        .map((t) => t.replace(/^#/, '').trim())
        .filter(Boolean);
      if (tagList.length > 5) {
        newErrors.tags = 'A maximum of 5 tags is allowed';
      }
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const tagList = formData.tags
      .split(/[, ]+/)
      .map((t) => t.replace(/^#/, '').trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: tagList,
      };
      if (formData.subject) {
        payload.subject = formData.subject;
      }

      const res = await questionService.createQuestion(payload);
      const newQuestion = res.data.data.question;
      navigate(`/questions/${newQuestion._id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
        'Failed to publish question. Please check all fields.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Ask a Doubt
              </h1>
              <p className="text-xs text-slate-500">
                Get answers from instructors, verified peers, and the community.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Tips for getting fast, accurate answers:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-indigo-800">
              <li>Summarize the specific problem in the title</li>
              <li>Include code snippets, error messages, and what you've already tried</li>
              <li>Add relevant course tags so teachers can find your doubt quickly</li>
            </ul>
          </div>

          {serverError && (
            <div className="mt-6">
              <ErrorMessage message={serverError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Input
              label="Question Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. How do I prevent infinite loops in useEffect when fetching API data?"
              error={errors.title}
            />

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">
                Subject Area (Optional)
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select subject or course</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Detailed Explanation"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide background context, minimal reproducible example, error logs, and expected behavior..."
              error={errors.description}
            />

            <Input
              label="Tags (Up to 5)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, hooks, javascript, async"
              error={errors.tags}
            />

            <div className="pt-2">
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto shadow-sm shadow-indigo-100">
                {submitting ? 'Publishing question...' : 'Publish Question'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}

export default AskQuestion;
