import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card variant="bordered" className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600">DistrictClose</h1>
            <p className="text-sm text-gray-500 mt-1">DC FSBO Transaction Manager</p>
          </div>
          <div className="mt-6">
            <CardTitle className="text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Start managing your DC real estate transaction
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
