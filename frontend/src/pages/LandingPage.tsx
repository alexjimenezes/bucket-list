import { Button } from '../components/ui';
import { auth } from '../lib/api';

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-[--radius-lg] p-6 shadow-sm border border-gray-100 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ExampleList({
  icon,
  title,
  type,
  progress,
  total,
  items,
}: {
  icon: string;
  title: string;
  type: 'individual' | 'group';
  progress: number;
  total: number;
  items: { text: string; done: boolean }[];
}) {
  const percentage = (progress / total) * 100;

  return (
    <div className="bg-white rounded-[--radius-lg] p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {type === 'group' && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              Shared
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {progress}/{total}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                item.done
                  ? 'bg-success-500 border-success-500 text-white'
                  : 'border-gray-300'
              }`}
            >
              {item.done && <span className="text-xs">✓</span>}
            </div>
            <span
              className={`text-sm ${
                item.done ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl flex items-center justify-center mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export function LandingPage() {
  const handleSignIn = () => {
    window.location.href = auth.getGoogleUrl();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-xl text-gray-900">Bucket List</span>
          </div>
          <Button onClick={handleSignIn} size="sm">
            Sign In with Google
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Turn your dreams into{' '}
            <span className="text-primary-600">checkmarks</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Track your life goals, celebrate achievements, and share the journey
            with friends and family.
          </p>
          <Button onClick={handleSignIn} size="lg" className="text-base px-8">
            Get Started — It's Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            Everything you need to chase your dreams
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Simple, beautiful, and designed to help you focus on what matters most.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="📝"
              title="Create Lists"
              description="Organize your dreams into personal or group bucket lists. Travel, fitness, learning—anything goes."
            />
            <FeatureCard
              icon="👥"
              title="Share the Journey"
              description="Invite friends and family to collaborate on shared goals. Dream together, achieve together."
            />
            <FeatureCard
              icon="🎉"
              title="Celebrate Wins"
              description="Every completed goal deserves a celebration. We'll cheer you on with every checkmark."
            />
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            What will you achieve?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From solo adventures to shared family goals, your bucket list is yours to define.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ExampleList
              icon="🌍"
              title="Travel Adventures"
              type="individual"
              progress={3}
              total={5}
              items={[
                { text: 'See the Northern Lights', done: true },
                { text: 'Road trip through Iceland', done: true },
                { text: 'Visit the Grand Canyon', done: true },
                { text: 'Walk the Great Wall of China', done: false },
                { text: 'Safari in Kenya', done: false },
              ]}
            />
            <ExampleList
              icon="👨‍👩‍👧‍👦"
              title="Family Goals"
              type="group"
              progress={2}
              total={4}
              items={[
                { text: 'Learn to cook together', done: true },
                { text: 'Family camping trip', done: true },
                { text: 'Visit Disneyland', done: false },
                { text: 'Build a treehouse', done: false },
              ]}
            />
            <ExampleList
              icon="🌱"
              title="Personal Growth"
              type="individual"
              progress={2}
              total={4}
              items={[
                { text: 'Read 20 books this year', done: true },
                { text: 'Learn to play guitar', done: true },
                { text: 'Run a marathon', done: false },
                { text: 'Learn a new language', done: false },
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Simple as 1, 2, 3
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Sign in with Google"
              description="One click to get started. No passwords to remember."
            />
            <StepCard
              number={2}
              title="Create your list"
              description="Add your dreams, big or small. Organize them your way."
            />
            <StepCard
              number={3}
              title="Check off your dreams"
              description="Complete goals and celebrate every achievement."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Join thousands of dreamers
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <StatCard icon="🎯" value="1,234" label="Lists Created" />
            <StatCard icon="✅" value="5,678" label="Dreams Achieved" />
            <StatCard icon="👥" value="890" label="Shared Adventures" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-[--radius-xl] p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-primary-100 mb-8">
              Free forever. No credit card required.
            </p>
            <Button
              onClick={handleSignIn}
              variant="outline"
              size="lg"
              className="bg-white text-primary-600 border-white hover:bg-primary-50"
            >
              Sign In with Google
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500">
          <p>
            Made with ❤️ · © {new Date().getFullYear()} Bucket List
          </p>
        </div>
      </footer>
    </div>
  );
}
