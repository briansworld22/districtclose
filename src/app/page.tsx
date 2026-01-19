import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Calculator,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DistrictClose</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
          <span>For Sale By Owner in Washington, D.C.</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Simplify Your DC
          <span className="text-blue-600"> Real Estate</span> Transaction
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          A collaborative platform for buyers and sellers to manage FSBO transactions
          in Washington, D.C. Track milestones, manage documents, and calculate
          DC-specific taxes all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={user ? '/dashboard' : '/auth/signup'}>
            <Button size="lg">
              Start Your Transaction
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Your DC FSBO Transaction
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Purpose-built for Washington, D.C. real estate with local tax calculations
            and regulatory compliance features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Collaborative"
            description="Both buyer and seller can access the same transaction dashboard in real-time."
          />
          <FeatureCard
            icon={<CheckCircle className="h-6 w-6" />}
            title="Timeline Tracking"
            description="Visual timeline with DC-specific milestones including HOA rescission and TOPA compliance."
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Document Management"
            description="Checklist for required DC forms with links to Google Drive or Dropbox."
          />
          <FeatureCard
            icon={<Calculator className="h-6 w-6" />}
            title="DC Tax Calculator"
            description="Accurate recordation and transfer tax calculations with first-time buyer benefits."
          />
        </div>
      </section>

      {/* DC-Specific Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Built for Washington, D.C.
              </h2>
              <ul className="space-y-4">
                <DCFeature
                  title="Recordation & Transfer Tax"
                  description="Automatic calculation based on DC's tiered rate structure ($400K threshold)"
                />
                <DCFeature
                  title="First-Time Buyer Benefits"
                  description="Track eligibility and calculate savings for first-time DC homebuyers"
                />
                <DCFeature
                  title="TOPA Compliance"
                  description="Automatic flagging and tracking for tenant-occupied properties"
                />
                <DCFeature
                  title="HOA/Condo Rescission"
                  description="3-day rescission period tracking for condominium purchases"
                />
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">DC Tax Rates</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property value ≤ $400K</span>
                    <span className="font-medium">1.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property value &gt; $400K</span>
                    <span className="font-medium">1.45%</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-blue-600">
                    <span>First-time buyer rate</span>
                    <span className="font-medium">0.725%*</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  *On recordation tax for homes under $500K
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Start Your Transaction?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Create your free account and start managing your DC FSBO transaction
            today. Invite the other party once you&apos;re ready.
          </p>
          <Link href={user ? '/dashboard' : '/auth/signup'}>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-white">DistrictClose</span>
            </div>
            <p className="text-sm">
              DC FSBO Transaction Manager. Not legal or financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function DCFeature({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </li>
  );
}
