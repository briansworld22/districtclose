import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { ChatWidget } from '@/components/ai/chat-widget';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <>
      <OnboardingWizard userEmail={user.email || ''} />
      <ChatWidget context={{ currentPage: 'onboarding' }} />
    </>
  );
}
