import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Container from "../../components/common/Container";
import Card from "../../components/common/Card";

function Landing() {
  return (
    <>
      <section className="py-24">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Ask questions. Share knowledge. Learn together.
            </h1>

            <p className="mt-6 text-lg text-slate-600">
              A collaborative learning platform where students and teachers can
              ask questions, share answers, and help each other learn.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link to="/register">
                <Button>Join the Community</Button>
              </Link>

              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-white">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <Card hoverable className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Ask Questions
              </h2>

              <p className="mt-3 text-slate-600">
                Post your doubts and get help from students and teachers.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Share Knowledge
              </h2>

              <p className="mt-3 text-slate-600">
                Answer questions and help others understand difficult concepts.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Learn Together
              </h2>

              <p className="mt-3 text-slate-600">
                Build a learning community where everyone can teach and learn.
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

export default Landing;
