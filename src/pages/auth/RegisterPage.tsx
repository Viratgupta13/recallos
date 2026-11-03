import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const result = await authService.register(data);
      setAuth(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      {/* Brand panel */}
      <div className="auth-brand-panel">
        <div style={{ maxWidth: 380, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 44, height: 44,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={24} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>RecallOS</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            Start your journey to<br />permanent memory.
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.65, fontSize: '0.9375rem' }}>
            Join RecallOS and transform how you learn. Active recall + spaced repetition = lasting knowledge.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={17} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-text)' }}>
              Recall<span style={{ color: 'var(--color-primary)' }}>OS</span>
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text)' }}>
            Create your account
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.875rem' }}>
            It's free to get started. No credit card required.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Aryan Sharma"
                className={`form-input ${errors.name ? 'error' : ''}`}
                {...register('name')}
              />
              {errors.name && <span className="form-error" role="alert">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                {...register('email')}
              />
              {errors.email && <span className="form-error" role="alert">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: 42 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error" role="alert">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <span className="form-error" role="alert">{errors.confirmPassword.message}</span>}
            </div>

            {serverError && (
              <div role="alert" style={{
                padding: '10px 14px',
                background: 'var(--color-danger-soft)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8375rem',
                marginBottom: 16,
              }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: 4 }}
              id="register-submit-btn"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
