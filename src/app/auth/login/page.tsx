import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card variant="bordered" className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600">DistrictClose</h1>
            <p className="text-sm text-gray-500 mt-1">DC FSBO Transaction Manager</p>
          </div>
          <div className="mt-6">
            <CardTitle className="text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to continue to your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginFormWrapper searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm redirectTo={params.redirectTo} />;
}
