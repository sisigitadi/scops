import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
   Lock, 
   Mail, 
   ArrowRight, 
   LogOut,
   ChevronLeft
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useOperations } from '../context/OperationsContext';
import { StaggerGroup, StaggerItem } from '../components/common/StaggerFadeIn';

/**
 * LoginPage — Gateway to Sovereign SOC Ecosystem
 * Implements strict credential verification with persona-based identity mapping and activity tracking.
 */

const PERSONA_MAP: Record<string, string> = {
  [ROLES.ADMIN]: 'admin',
  [ROLES.MANAGER]: 'manager',
  [ROLES.L2_ANALYST]: 'l2',
  [ROLES.L1_ANALYST]: 'l1',
  [ROLES.DEMO]: 'demo',
  [ROLES.AUDITOR]: 'auditor'
};

const PERSONAS = [
  { id: 'admin-01', role: ROLES.ADMIN },
  { id: 'mgr-02', role: ROLES.MANAGER },
  { id: 'l2-03', role: ROLES.L2_ANALYST },
  { id: 'l1-04', role: ROLES.L1_ANALYST },
  { id: 'gst-06', role: ROLES.DEMO },
  { id: 'auditor-05', role: ROLES.AUDITOR }
];

export default function LoginPage() {
  const { verifyCredentials, login, logout, user } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { trackActivity } = useOperations();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-Clear Protocol: Ensure clean session state upon hitting login page
  useEffect(() => {
    if (user) {
      logout();
    }
  }, [user, logout]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError('');
    setLoading(true);
    try {
      const authUser = await verifyCredentials(email, password);
      const persona = PERSONAS.find(p => p.role === authUser.role);
      
      if (persona) {
        const pKey = PERSONA_MAP[persona.role];
        const personaNameKey = `auth.personas.${pKey}.name`;
        const translatedName = t(personaNameKey);
        
        login({
          id: authUser.id,
          email: authUser.email,
          name: authUser.name || (translatedName !== personaNameKey ? translatedName : authUser.role),
          role: authUser.role
        });
        
        trackActivity('SYSTEM_LOGIN', `Access granted for ${authUser.name} (${authUser.role})`, 'SUCCESS', {
          id: authUser.id,
          name: authUser.name,
          role: authUser.role
        });

        navigate(from, { replace: true });
      } else {
        throw new Error(t('login.personaError'));
      }
    } catch (err: any) {
      setError(err.message || t('login.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 3 && password.length >= 4;

  return (
    <div className="min-h-screen bg-background-main flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] opacity-50 dark:opacity-100" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] opacity-50 dark:opacity-100" />

      <StaggerGroup className="w-full max-w-md z-10 space-y-8" stagger={0.12}>
        <StaggerItem className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-card border border-border-primary shadow-2xl mb-4 relative group overflow-hidden floating">
            <div className="absolute inset-0 bg-accent-cyan/10 blur-xl group-hover:bg-accent-cyan/20 transition-colors" />
            <img 
              src={settings.appLogo || `${import.meta.env.BASE_URL}logo.png`} 
              alt="Logo" 
              className="w-10 h-10 object-contain relative z-10 drop-shadow-lg" 
            />
          </Link>
          <h1 className="text-3xl font-bold text-foreground-primary tracking-tight uppercase tracking-widest leading-none">{settings.appName}</h1>
          <p className="text-foreground-muted mt-3 font-medium opacity-60 uppercase tracking-widest text-[10px]">{settings.orgName}</p>
        </StaggerItem>

        <StaggerItem className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl overflow-hidden p-8 relative transition-all shine">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground-primary mb-1 uppercase tracking-tight leading-none">{t('login.title')}</h2>
              <p className="text-[10px] text-foreground-tertiary font-black tracking-widest uppercase opacity-60 mt-2">{t('login.subtitle')}</p>
            </div>

            {error && (
              <div className="p-4 bg-status-danger-bg/20 text-status-danger-text border border-status-danger-border/30 rounded-xl text-[10px] flex items-center gap-3 font-black uppercase tracking-widest">
                <LogOut className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground-tertiary mb-2 uppercase tracking-widest pl-2 font-black">{t('login.email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-bg-panel/40 border border-border-primary rounded-xl text-foreground-primary placeholder-foreground-muted focus:outline-none focus:border-accent-cyan transition-all font-bold"
                    placeholder="analis@socops.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground-tertiary mb-2 uppercase tracking-widest pl-2 font-black">{t('login.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-bg-panel/40 border border-border-primary rounded-xl text-foreground-primary placeholder-foreground-muted focus:outline-none focus:border-accent-cyan transition-all font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border-none rounded-xl shadow-xl text-[11px] font-black text-white bg-accent-cyan hover:bg-accent-cyan/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('login.submit')} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-border-primary rounded-xl text-[10px] font-black text-foreground-secondary bg-bg-card hover:bg-white/5 transition-all uppercase tracking-widest"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('login.backToPortal')}
              </button>
            </div>
          </form>
        </StaggerItem>

        <StaggerItem className="text-center text-[10px] text-foreground-muted mt-8 font-black uppercase tracking-widest opacity-40">
          {settings.appName} Platform V11.7.0 &copy; {new Date().getFullYear()}
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
