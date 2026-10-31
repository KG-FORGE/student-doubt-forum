import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import Container from '../../components/common/Container.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import QuestionCard from '../../components/common/QuestionCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import * as questionService from '../../services/questionService.js';
import * as subjectService from '../../services/subjectService.js';
import {
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Filter,
} from 'lucide-react';

function TeacherDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('unverified'); // 'unverified' | 'unanswered'
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);

  // Load subjects
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await subjectService.getSubjects();
        setSubjects(res.data.data.subjects || []);
      } catch (_) {}
    }
    loadSubjects();
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 40 };
      if (selectedSubject) params.subject = selectedSubject;

      if (activeTab === 'unanswered') {
        params.sort = 'unanswered';
      }

      const res = await questionService.getQuestions(params);
      let list = res.data.data.questions || [];

      if (activeTab === 'unverified') {
        // Filter to doubts with at least 1 answer but no verified answer yet
        list = list.filter((q) => q.answerCount > 0 && !q.hasVerifiedAnswer);
      }

      setQuestions(list);
    } catch (err) {
      console.error('Failed to load teacher questions:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedSubject]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <Container className="py-8">
      {/* Teacher Profile Card */}
      <Card className="p-8 border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-2xl text-white shadow-md shadow-purple-100">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user?.name}</h1>
                <Badge variant="teacher">Instructor / Teacher</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-purple-700">
                <span className="rounded bg-purple-50 px-2.5 py-0.5 border border-purple-200">
                  ★ {user?.reputation ?? 0} Reputation Points
                </span>
                {user?.subject && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                    Field: {user.subject}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 text-xs text-purple-900 max-w-sm">
            <span className="font-bold flex items-center gap-1 mb-1">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Teacher Privileges Active:
            </span>
            You can verify accurate answers with the instructor badge and award students +15 reputation points.
          </div>
        </div>
      </Card>

      {/* Filter and Tab controls */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 gap-4">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('unverified')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'unverified'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Needs Verification Review
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unanswered')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'unanswered'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Unanswered Doubts
          </button>
        </div>

        {/* Subject filter */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed */}
      <div className="mt-6">
        {loading ? (
          <LoadingSpinner text="Loading doubts for teacher review..." />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={
              activeTab === 'unverified'
                ? 'No doubts currently awaiting verification'
                : 'No unanswered doubts at the moment'
            }
            description="All student questions in this category have either been verified or answered!"
            actionLabel="Explore All Doubts"
            onAction={() => (window.location.href = '/questions')}
          />
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q._id} className="relative">
                <QuestionCard
                  _id={q._id}
                  title={q.title}
                  description={q.description}
                  tags={q.tags}
                  voteScore={q.voteScore}
                  answerCount={q.answerCount}
                  author={q.author}
                  subject={q.subject}
                  hasVerifiedAnswer={q.hasVerifiedAnswer}
                  viewCount={q.viewCount}
                  createdAt={q.createdAt}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

export default TeacherDashboard;
