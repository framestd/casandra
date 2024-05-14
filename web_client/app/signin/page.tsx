import { redirect } from 'next/navigation';

import { AuthLayout } from '@/core/composition/AuthLayout';
import { getAppServerSession } from '@/core/services/next-auth';
import { Routes } from '@/core/utils/routes';

import { SigninForm } from './signin-form';

const Signup = async () => {
  const session = await getAppServerSession();

  if (session && session.tokens) {
    redirect(Routes.CONVERSATIONS_NEW);
  }

  return (
    <AuthLayout>
      <SigninForm />
    </AuthLayout>
  );
};

export default Signup;
