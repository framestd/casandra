import { redirect } from 'next/navigation';

import { AuthLayout } from '@/core/composition/AuthLayout';
import { getAppServerSession } from '@/core/services/next-auth';
import { Routes } from '@/core/utils/routes';

import { SignupForm } from './signup-form';

const Signup = async () => {
  const session = await getAppServerSession();

  if (session && session.tokens) {
    redirect(Routes.CONVERSATIONS_NEW);
  }

  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
