import { Link } from 'react-router';
import Button from '../../components/common/Button.jsx';
import Container from '../../components/common/Container.jsx';
import Card from '../../components/common/Card.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import {
  HelpCircle,
  ShieldCheck,
  Award,
  Users,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

function Landing() {
  const { isAuthenticated, isStudent, isTeacher, isAdmin } = useAuth();

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isTeacher) return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl opacity-30 pointer-events-none">
        <div className="h-96 w-[50rem] bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-6 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Collaborative Peer-to-Peer Academic Forum
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-tight">
              Ask doubts. <span className="text-indigo-600">Share knowledge.</span> Master concepts together.
            </h1>

            <p className="mt-6 text-base text-slate-600 sm:text-lg sm:leading-relaxed">
              A high-integrity learning space where students post programming and academic questions, collaborate on answers, and get verified solutions from instructors.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/questions">
                    <Button className="flex items-center gap-2 shadow-md shadow-indigo-100">
                      Explore Doubts
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link to={getDashboardPath()}>
                    <Button variant="secondary">Go to Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button className="flex items-center gap-2 shadow-md shadow-indigo-100">
                      Join the Community
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link to="/questions">
                    <Button variant="secondary">Browse Doubts</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Platform proof metrics */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200/80 pt-8 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 mt-0.5">Instructor Verified Solutions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">O(1)</p>
                <p className="text-xs text-slate-500 mt-0.5">Fast Peer Responses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Gamified</p>
                <p className="text-xs text-slate-500 mt-0.5">Reputation & Badges</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-slate-50/70 border-t border-slate-200/80">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Engineered for Student Success
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Everything students and educators need to foster meaningful academic discussion.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card hoverable className="p-8 border border-slate-200/90 bg-white shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Ask Questions Seamlessly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Categorize your doubt by subject area, tag programming languages, and attach code snippets for maximum clarity.
              </p>
            </Card>

            <Card hoverable className="p-8 border border-slate-200/90 bg-white shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Teacher Verified Answers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Instructors review and officially stamp answers that are accurate, making trusted solutions easily discoverable at the top.
              </p>
            </Card>

            <Card hoverable className="p-8 border border-slate-200/90 bg-white shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Earn Reputation Points
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Gain reputation when peers upvote your helpful answers and bonus points when an instructor verifies your contribution.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Community CTA */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <Container>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to clear your doubts?
            </h2>
            <p className="mt-3 text-indigo-100 text-sm">
              Join thousands of fellow students and mentors discussing algorithms, web development, systems, and mathematics.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/register">
                <button
                  type="button"
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition"
                >
                  Create Student Account
                </button>
              </Link>
              <Link to="/questions">
                <button
                  type="button"
                  className="rounded-lg border border-indigo-300 bg-indigo-700/50 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  View Doubts
                </button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Landing;
