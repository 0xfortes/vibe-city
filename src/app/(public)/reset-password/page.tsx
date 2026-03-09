import { Container } from '@/components/ui';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Container className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <ResetPasswordForm />
    </Container>
  );
}
