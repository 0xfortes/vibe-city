import { Container } from '@/components/ui';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <SignupForm />
    </Container>
  );
}
