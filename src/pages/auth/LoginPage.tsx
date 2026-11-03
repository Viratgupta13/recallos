import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Eye, EyeOff, BookOpen, Brain, Radar, BarChart3 } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            Learn it.<br />Recall it.<br />Remember it.
          </h1>
          <p style={{ opacity: 0.85, lineHeight: 1.65, fontSize: '0.9375rem', marginBottom: 40 }}>
            Your personal knowledge operating system for active recall and spaced repetition.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {[
              { icon: <BookOpen size={18} />, text: 'Add your learning material' },
              { icon: <Brain size={18} />, text: 'Track memory strength per topic' },
              { icon: <Radar size={18} />, text: 'Detect forgetting before it happens' },
              { icon: <BarChart3 size={18} />, text: 'Measure your knowledge health' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34,
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {icon}
                </div>
                <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
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
            Welcome back
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, fontSize: '0.875rem' }}>
            Sign in to continue your learning journey
          </p>

          {/* Demo hint */}
          <div style={{
            background: 'var(--color-primary-soft)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: '0.8rem',
            color: 'var(--color-primary)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}>
            <strong>Demo:</strong> aryan@example.com / password123
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                {...register('email')}
              />
              {errors.email && <span className="form-error" role="alert">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
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

            {serverError && (
              <div role="alert" style={{
                padding: '10px 14px',
                background: 'var(--color-danger-soft)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8375rem',
                marginBottom: 16,
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: 4 }}
              id="login-submit-btn"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
