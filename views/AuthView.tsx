import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { PhoneIcon } from '../components/icons/HeroIcons';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthViewProps {
  onLogin: (user: User) => void;
  onSignup: (details: { name: string; emailOrPhone: string; password: string; role: UserRole; }) => void;
  users: User[];
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignup, users }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.Customer);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  
  // Form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // OTP State
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');


  // Forgot Password Modal State
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetEmailOrPhone, setResetEmailOrPhone] = useState('');
  const [resetConfirmation, setResetConfirmation] = useState('');

  const generateAndSendOtp = useCallback(() => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    // Simulate sending OTP
    console.log(`OTP for ${emailOrPhone.trim()} is ${newOtp}`);
    setOtpMessage(t('otpFor', { otp: newOtp }));
    setResendTimer(30);
  }, [emailOrPhone, t]);

  // FIX: Corrected timer logic for browser environment and to prevent potential runtime errors with uninitialized variables.
  useEffect(() => {
    if (resendTimer > 0) {
        const interval = setInterval(() => {
            setResendTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const resetAuthState = useCallback((newAuthMethod: 'password' | 'otp' = 'password') => {
    setEmailOrPhone('');
    setPassword('');
    setName('');
    setError('');
    setAuthMethod(newAuthMethod);
    setOtp('');
    setGeneratedOtp(null);
    setOtpStep('enter_phone');
    setSignupStep('details');
    setResendTimer(0);
    setOtpMessage('');
  }, []);

  useEffect(() => {
    resetAuthState();
    if (activeTab === UserRole.Admin) {
      setAuthMode('login');
    }
  }, [activeTab, authMode, resetAuthState]);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedEmailOrPhone = emailOrPhone.trim();
    const trimmedPassword = password.trim();

    const userToLogin = users.find(u =>
      (u.email.toLowerCase() === trimmedEmailOrPhone.toLowerCase() || u.phone === trimmedEmailOrPhone) &&
      u.role === activeTab
    );
    
    if (userToLogin && userToLogin.password === trimmedPassword) {
      if (userToLogin.isBlocked) {
        setError(t('accountBlocked'));
        return;
      }
      onLogin(userToLogin);
    } else {
      setError(t('invalidCredentials'));
    }
  };
  
  const handleSignupAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    const trimmedEmailOrPhone = emailOrPhone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmailOrPhone || !trimmedPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (!/^\d{10}$/.test(trimmedEmailOrPhone) && !/^\S+@\S+\.\S+$/.test(trimmedEmailOrPhone)) {
        setError(t('validPhoneOrEmail'));
        return;
    }
    
    if (activeTab === UserRole.Influencer) {
      if (trimmedPassword.length < 8) {
        setError(t('passwordLength'));
        return;
      }
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(trimmedPassword)) {
        setError(t('passwordSpecialChar'));
        return;
      }
    }

    const userExists = users.some(u => u.email.toLowerCase() === trimmedEmailOrPhone.toLowerCase() || u.phone === trimmedEmailOrPhone);
    if (userExists) {
      setError(t('accountExists'));
      return;
    }
    
    // Proceed to OTP verification for phone numbers
    if (/^\d{10}$/.test(trimmedEmailOrPhone)) {
        generateAndSendOtp();
        setSignupStep('otp');
    } else {
        // Direct signup for email
        onSignup({
            name: trimmedName,
            emailOrPhone: trimmedEmailOrPhone,
            password: trimmedPassword,
            role: activeTab
        });
    }
  };

  const handleVerifySignupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
        onSignup({
            name: name.trim(),
            emailOrPhone: emailOrPhone.trim(),
            password: password.trim(),
            role: activeTab
        });
    } else {
        setError(t('invalidOtp'));
    }
  };


  const handleSendOtpForLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedPhone = emailOrPhone.trim();
    if (!/^\d{10}$/.test(trimmedPhone)) {
        setError(t('validPhoneOrEmail'));
        return;
    }

    const userToLogin = users.find(u => u.phone === trimmedPhone && u.role === activeTab);
    if (userToLogin) {
        if (userToLogin.isBlocked) {
            setError(t('accountBlocked'));
            return;
        }
        generateAndSendOtp();
        setOtpStep('enter_otp');
    } else {
        setError(t('noAccountFound'));
    }
  };

  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      if (otp.trim() === generatedOtp) {
            const userToLogin = users.find(u => u.phone === emailOrPhone.trim() && u.role === activeTab);
            if (userToLogin) {
              onLogin(userToLogin);
            } else {
                setError(t('unexpectedError'));
                setOtpStep('enter_phone');
            }
      } else {
          setError(t('invalidOtp'));
      }
  };
  
  const handleOpenForgotPasswordModal = () => {
    setResetEmailOrPhone('');
    setResetConfirmation('');
    setError('');
    setForgotPasswordModalOpen(true);
  };

  const handleForgotPasswordRequest = (e: React.FormEvent) => {
      e.preventDefault();
      console.log(`Password reset requested for: ${resetEmailOrPhone}`);
      setResetConfirmation('If an account with that email or phone exists, a password reset link has been sent.');
      setResetEmailOrPhone('');
  };

  const TabButton: React.FC<{role: UserRole, label: string}> = ({ role, label }) => {
    const isActive = activeTab === role;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(role)}
        className={`w-full py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-200 ${
          isActive
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {label}
      </button>
    );
  };
  
  const getTitle = () => {
    if (activeTab === UserRole.Admin) {
        return t('staffLogin');
    }
     if (authMethod === 'otp') {
        return t('loginWithOtpAs', { role: activeTab });
    }
    return authMode === 'login' ? t('loginAs', { role: activeTab }) : t('createAccountAs', { role: activeTab });
  };

  const renderSignupForm = () => (
     <form onSubmit={signupStep === 'details' ? handleSignupAction : handleVerifySignupOtp} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('fullName')}</label>
          <input id="name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="John Doe" disabled={signupStep === 'otp'}
          />
        </div>
        <div>
          <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">{t('emailOrPhone')}</label>
          <input id="emailOrPhone" name="emailOrPhone" type="text" required value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com or 1234567890" disabled={signupStep === 'otp'}
          />
          <p className="mt-1 text-xs text-gray-500">{t('otpVerificationRequired')}</p>
        </div>
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-gray-700">{t('password')}</label>
          <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="••••••••" disabled={signupStep === 'otp'}
          />
        </div>

        {signupStep === 'otp' && (
             <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">{t('enterOtp')}</label>
                <input id="otp" name="otp" type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="6-digit OTP"
                />
                 {otpMessage && (
                    <div className="mt-2 p-3 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                        {otpMessage}
                    </div>
                )}
                 <div className="text-right text-sm mt-1">
                    {resendTimer > 0 ? (
                        <span className="text-gray-500">{t('resendOtpIn', { seconds: resendTimer })}</span>
                    ) : (
                        <button type="button" onClick={generateAndSendOtp} className="font-medium text-indigo-600 hover:text-indigo-500">
                            {t('resendOtp')}
                        </button>
                    )}
                </div>
            </div>
        )}
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full">
            {signupStep === 'details' ? t('continue') : t('verifyAndCreateAccount')}
        </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">{t('collabzy')}</h1>
          <p className="text-center text-gray-500 mb-6">{t('connectAndCollaborate')}</p>
        </div>
        
        <div className="grid grid-cols-3 border-b border-gray-200">
           <TabButton role={UserRole.Customer} label={t('brandCustomer')} />
           <TabButton role={UserRole.Influencer} label={t('influencer')} />
           <TabButton role={UserRole.Admin} label={t('collabzyStaff')} />
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            {getTitle()}
          </h2>

          {authMethod === 'password' && (
            <>
              {authMode === 'login' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                        <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">{t('emailOrPhone')}</label>
                        <input id="emailOrPhone" name="emailOrPhone" type="text" required value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="you@example.com or 1234567890"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">{t('password')}</label>
                        <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>
                     {activeTab !== UserRole.Admin && (
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                            <button type="button" onClick={handleOpenForgotPasswordModal} className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline">
                                {t('forgotPassword')}
                            </button>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" className="w-full">{t('login')}</Button>
                </form>
              ) : renderSignupForm()}
              
              {activeTab !== UserRole.Admin && (
                <p className="text-center text-sm text-gray-600 mt-6">
                  {authMode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                  >
                    {authMode === 'login' ? t('createAccount') : t('login')}
                  </button>
                </p>
              )}
            </>
          )}

          {authMethod === 'otp' && activeTab !== UserRole.Admin && (
            <form onSubmit={otpStep === 'enter_phone' ? handleSendOtpForLogin : handleVerifyOtpAndLogin} className="space-y-4">
              {otpStep === 'enter_phone' ? (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input id="phone" name="phone" type="tel" required value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full">
                      {t('sendOtp')}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input id="phone" name="phone" type="tel" required value={emailOrPhone} disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">{t('enterOtp')}</label>
                    <input id="otp" name="otp" type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="6-digit OTP"
                    />
                  </div>
                   {otpMessage && (
                    <div className="mt-2 p-3 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                        {otpMessage}
                    </div>
                  )}
                   <div className="text-right text-sm">
                    {resendTimer > 0 ? (
                        <span className="text-gray-500">{t('resendOtpIn', { seconds: resendTimer })}</span>
                    ) : (
                        <button type="button" onClick={handleSendOtpForLogin} className="font-medium text-indigo-600 hover:text-indigo-500">
                            {t('resendOtp')}
                        </button>
                    )}
                </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full">
                    {t('verifyAndLogin')}
                  </Button>
                </>
              )}
              <p className="text-center text-sm text-gray-600 mt-6">
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                >
                  {t('loginWithPassword')}
                </button>
              </p>
            </form>
          )}

          {authMethod === 'password' && authMode === 'login' && activeTab !== UserRole.Admin && (
              <>
                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <Button variant="secondary" className="w-full bg-green-50 hover:bg-green-100 !text-green-700 border border-green-200" onClick={() => resetAuthState('otp')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.687-1.475L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.433-9.89-9.889-9.89-5.452 0-9.887 4.434-9.889 9.891.001 2.245.654 4.407 1.84 6.22l-1.094 3.976 4.049-1.078z" /></svg>
                    {t('loginWithWhatsApp')}
                </Button>
              </>
          )}
        </div>
      </Card>

      <Modal isOpen={isForgotPasswordModalOpen} onClose={() => setForgotPasswordModalOpen(false)} title={t('resetPassword')}>
        <>
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
            {resetConfirmation ? (
                <p className="text-sm text-green-700 bg-green-100 p-3 rounded-md">{resetConfirmation}</p>
            ) : (
                <>
                <p className="text-sm text-gray-600">{t('resetPasswordInstruction')}</p>
                <div>
                    <label htmlFor="resetEmailOrPhone" className="block text-sm font-medium text-gray-700">{t('emailOrPhone')}</label>
                    <input
                    id="resetEmailOrPhone"
                    name="resetEmailOrPhone"
                    type="text"
                    required
                    value={resetEmailOrPhone}
                    onChange={(e) => setResetEmailOrPhone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@example.com"
                    />
                </div>
                </>
            )}
            <div className="flex justify-end pt-4 border-t">
                {resetConfirmation ? (
                    <Button type="button" variant="secondary" onClick={() => setForgotPasswordModalOpen(false)}>
                        {t('close')}
                    </Button>
                ) : (
                    <Button type="submit">
                        {t('sendResetLink')}
                    </Button>
                )}
            </div>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
                {t('rememberedPassword')}
                <button
                    type="button"
                    onClick={() => setForgotPasswordModalOpen(false)}
                    className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                >
                    {t('login')}
                </button>
            </p>
        </>
      </Modal>
    </div>
  );
};

export default AuthView;