import { AuthLayout } from '@/core/composition/AuthLayout';

import { SigninForm } from './signin-form';

const Signup = () => {
  return (
    <AuthLayout>
      <SigninForm />
    </AuthLayout>
  );
};

export default Signup;
