import { AuthLayout } from '@/core/composition/AuthLayout';

import { SignupForm } from './signup-form';

const Signup = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
