import { Button } from '../components/ui';
import { auth } from '../lib/api';

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-[--radius-xl] p-8 text-center shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-2 border border-white/50 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="text-5xl mb-5 animate-float"
        style={{ animationDelay: `${index * 0.2}s` }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
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
  index,
}: {
  icon: string;
  title: string;
  type: 'individual' | 'group';
  progress: number;
  total: number;
  items: { text: string; done: boolean }[];
  index: number;
}) {
  const percentage = (progress / total) * 100;

  return (
    <div
      className="bg-white/90 backdrop-blur-sm rounded-[--radius-xl] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-gray-100 hover:border-primary-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {type === 'group' && (
            <span className="text-xs bg-pastel-purple text-purple-700 px-2.5 py-1 rounded-full font-medium">
              Shared
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
          {progress}/{total}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-pink-400 via-purple-400 to-primary-500 h-2 rounded-full transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                item.done
                  ? 'bg-gradient-to-r from-success-400 to-success-500 border-success-500 text-white shadow-glow-success'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {item.done && <span className="text-xs">✓</span>}
            </div>
            <span
              className={`text-sm transition-colors ${
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
  index,
}: {
  number: number;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div
      className="text-center animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
        {number}
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  index,
}: {
  icon: string;
  value: string;
  label: string;
  index: number;
}) {
  return (
    <div
      className="text-center p-6 rounded-[--radius-xl] bg-white/60 backdrop-blur-sm animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="text-4xl mb-3 animate-float">{icon}</div>
      <div className="text-3xl font-bold text-gradient-primary">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export function LandingPage() {
  const handleSignIn = () => {
    window.location.href = auth.getGoogleUrl();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-wiggle transition-transform">🎯</span>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Bucket List
            </span>
          </div>
          <Button onClick={handleSignIn} size="sm" variant="gradient">
            Sign In with Google
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-70" />

        {/* Floating decorative shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pastel-pink rounded-full blur-3xl opacity-60 animate-float" />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-pastel-purple rounded-full blur-3xl opacity-60 animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-40 right-1/4 w-24 h-24 bg-pastel-blue rounded-full blur-2xl opacity-50 animate-float"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-bounce-in">✨🎯✨</div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
            Turn your dreams into{' '}
            <span className="text-gradient-primary">checkmarks</span>
          </h1>

          <p
            className="text-xl text-gray-600 mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Track your life goals, celebrate achievements, and share the journey
            with friends and family. 💕
          </p>

          <Button
            onClick={handleSignIn}
            variant="gradient"
            size="lg"
            className="text-lg px-10 py-4 shadow-glow-primary animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started — It's Free ✨
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4 animate-fade-in">
            Everything you need to chase your dreams
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto animate-fade-in">
            Simple, beautiful, and designed to help you focus on what matters most.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="📝"
              title="Create Lists"
              description="Organize your dreams into personal or group bucket lists. Travel, fitness, learning—anything goes."
              index={0}
            />
            <FeatureCard
              icon="👥"
              title="Share the Journey"
              description="Invite friends and family to collaborate on shared goals. Dream together, achieve together."
              index={1}
            />
            <FeatureCard
              icon="📸"
              title="Capture Memories"
              description="Add photos when you complete a goal. Build a beautiful gallery of your achievements."
              index={2}
            />
            <FeatureCard
              icon="🎉"
              title="Celebrate Wins"
              description="Every completed goal deserves a celebration. We'll cheer you on with every checkmark."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 px-4">
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
              index={0}
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
              index={1}
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
              index={2}
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

      {/* Memories Carousel Section */}
      <section className="py-20 px-4 bg-white/50 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            Your memories, beautifully preserved 📸
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Every completed goal becomes a memory. Add photos to capture the moment
            and browse them in your personal gallery.
          </p>

          {/* Mock Polaroid Carousel */}
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/50 to-transparent z-10 pointer-events-none" />

            <div className="flex gap-4 md:gap-6 justify-center items-end pb-4">
              {/* Polaroid 1 */}
              <div
                className="relative flex-shrink-0 bg-white rounded-sm shadow-soft p-2 pb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: '0s' }}
              >
                <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-sm flex items-center justify-center">
                  <span className="text-4xl md:text-5xl">🏔️</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-[10px] text-gray-500 font-medium truncate">Hiked Mt. Fuji</p>
                  <p className="text-[9px] text-gray-400">Jul 15, 2024</p>
                </div>
              </div>

              {/* Polaroid 2 */}
              <div
                className="relative flex-shrink-0 bg-white rounded-sm shadow-soft-lg p-2 pb-10 transform rotate-1 hover:rotate-0 transition-transform duration-300 animate-fade-in-up scale-105"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-pastel-pink to-pastel-purple rounded-sm flex items-center justify-center">
                  <span className="text-5xl md:text-6xl">🎸</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-[10px] text-gray-500 font-medium truncate">Learned guitar</p>
                  <p className="text-[9px] text-gray-400">Aug 3, 2024</p>
                </div>
              </div>

              {/* Polaroid 3 */}
              <div
                className="relative flex-shrink-0 bg-white rounded-sm shadow-soft p-2 pb-10 transform rotate-2 hover:rotate-0 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-pastel-mint to-pastel-blue rounded-sm flex items-center justify-center">
                  <span className="text-4xl md:text-5xl">🌊</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-[10px] text-gray-500 font-medium truncate">Surfed in Hawaii</p>
                  <p className="text-[9px] text-gray-400">Sep 21, 2024</p>
                </div>
              </div>

              {/* Polaroid 4 - hidden on small screens */}
              <div
                className="relative hidden md:block flex-shrink-0 bg-white rounded-sm shadow-soft p-2 pb-10 transform -rotate-2 hover:rotate-0 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="w-36 h-36 bg-gradient-to-br from-yellow-100 to-pastel-pink rounded-sm flex items-center justify-center">
                  <span className="text-5xl">🎂</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-[10px] text-gray-500 font-medium truncate">Made birthday cake</p>
                  <p className="text-[9px] text-gray-400">Oct 5, 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* How it works mini-section */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                  <span className="text-success-600">✓</span>
                </div>
                <span className="text-sm text-gray-600">Complete a goal</span>
              </div>
              <span className="hidden md:block text-gray-300">→</span>
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span>📷</span>
                </div>
                <span className="text-sm text-gray-600">Add a photo</span>
              </div>
              <span className="hidden md:block text-gray-300">→</span>
              <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="w-10 h-10 rounded-full bg-pastel-purple flex items-center justify-center">
                  <span>🖼️</span>
                </div>
                <span className="text-sm text-gray-600">Memories gallery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Simple as 1, 2, 3 ✨
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <StepCard
              number={1}
              title="Sign in with Google"
              description="One click to get started. No passwords to remember."
              index={0}
            />
            <StepCard
              number={2}
              title="Create your list"
              description="Add your dreams, big or small. Organize them your way."
              index={1}
            />
            <StepCard
              number={3}
              title="Check off your dreams"
              description="Complete goals and celebrate every achievement."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Join thousands of dreamers 🌟
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard icon="🎯" value="1,234" label="Lists Created" index={0} />
            <StatCard icon="✅" value="5,678" label="Dreams Achieved" index={1} />
            <StatCard icon="👥" value="890" label="Shared Adventures" index={2} />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-cta rounded-[--radius-2xl] p-10 md:p-14 text-center text-white overflow-hidden shadow-soft-xl">
            {/* Animated sparkles */}
            <div className="absolute top-4 left-8 text-2xl animate-sparkle">✨</div>
            <div
              className="absolute top-8 right-12 text-xl animate-sparkle"
              style={{ animationDelay: '0.5s' }}
            >
              ⭐
            </div>
            <div
              className="absolute bottom-6 left-16 text-lg animate-sparkle"
              style={{ animationDelay: '1s' }}
            >
              💫
            </div>
            <div
              className="absolute bottom-10 right-20 text-2xl animate-sparkle"
              style={{ animationDelay: '1.5s' }}
            >
              ✨
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
              Ready to start your journey? 🚀
            </h2>
            <p className="text-white/80 mb-8 text-lg relative">
              Free forever. No credit card required.
            </p>
            <Button
              onClick={handleSignIn}
              size="lg"
              variant="outline"
              className="bg-white text-primary-600 hover:text-primary-700 border-white hover:border-white hover:bg-gray-50 shadow-soft-lg hover:shadow-soft-xl transition-all px-10 relative"
            >
              Sign In with Google ✨
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 bg-white/50">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500">
          <p>Made with 💕 · © {new Date().getFullYear()} Bucket List</p>
        </div>
      </footer>
    </div>
  );
}
