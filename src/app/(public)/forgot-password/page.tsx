import { Container } from '@/components/ui';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <ForgotPasswordForm />
    </Container>
  );
}
