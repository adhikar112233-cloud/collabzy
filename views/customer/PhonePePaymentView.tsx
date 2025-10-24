import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface PaytmPaymentViewProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
}

const Spinner: React.FC<{ color?: string }> = ({ color = 'text-white' }) => (
    <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const VerifiedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.03 15.41l-3.54-3.54 1.41-1.41 2.12 2.12 4.95-4.95 1.41 1.41-6.36 6.37z" />
    </svg>
);

const PaytmLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.93 13.24V4.96h2.15v8.28H30.93z" fill="#002970"></path><path d="M35.61 4.96h-2.18v8.28h2.18V4.96z" fill="#00B9F1"></path><path d="M39.69 13.24h-2.1v-5.2h-2.3v5.2h-2.1V4.96h6.5v8.28z" fill="#002970"></path><path d="M44.97 13.24V4.96h2.15v8.28H44.97z" fill="#00B9F1"></path><path d="M49.65 4.96h-2.18v8.28h2.18V4.96z" fill="#002970"></path><path d="M51.92 13.24l-3.3-8.28h2.26l2.17 5.75 2.17-5.75h2.26l-3.3 8.28h-2.26z" fill="#00B9F1"></path><path d="M11.59 13.24L8.29 4.96h2.26l2.17 5.75 2.17-5.75H17l-3.3 8.28h-2.11z" fill="#00B9F1"></path><path d="M21.28 13.24h-2.1v-5.2h-2.31v5.2h-2.1V4.96h6.5v8.28z" fill="#002970"></path><path d="M25.74 4.96h3.44v1.51h-3.44v2.33h2.3v1.5h-2.3v2.94h-2.15V4.96h2.15z" fill="#00B9F1"></path><path d="M3.86 10.1c0 .7.12 1.3.36 1.83.24.53.58.96 1.03 1.28.45.32 1 .54 1.63.66.64.12 1.33.12 2.08.12.75 0 1.44 0 2.08-.12.63-.12 1.18-.34 1.63-.66.45-.32.79-.75 1.03-1.28.24-.53.36-1.13.36-1.83V8.81c0-1.87-1.1-2.9-3.29-3.08-1.04-.08-2.1-.08-3.18 0C5 5.9 3.86 6.95 3.86 8.8v1.3z" fill="#002970"></path><path d="M8.96 5.2c1.04-.04 2.1-.04 3.18 0 .5.04.9.16 1.18.36.28.2.48.5.58.87.1.38.16.8.16 1.25v1.3c0 .45-.05.87-.16 1.25a2.1 2.1 0 01-.58.87c-.28.2-.68.32-1.18.36-1.08.04-2.14.04-3.18 0-.5-.04-.9-.16-1.18-.36-.28-.2-.48-.5-.58-.87-.1-.38-.16-.8-.16-1.25V8.8c0-.45.05-.87.16-1.25.1-.37.3-.67.58-.87.28-.2.68-.32 1.18-.36z" fill="#fff"></path></svg>
);
const PhonePeLogoMini: React.FC<{ className?: string }> = ({ className }) => <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="9" r="9" fill="#5F259F"/><path d="M12.2887 7.28945L12.0527 7.28255V9.45665L12.2887 9.44975C13.2577 9.39065 13.9117 8.65025 13.9117 7.86875C13.9117 7.50215 13.7842 7.18205 13.564 6.94625C13.2367 6.61115 12.7987 6.43625 12.2887 6.44315V7.28945ZM11.1643 6.44315H10.0273V11.5568H11.1643V6.44315ZM10.5958 8.57725H12.2887C12.7849 8.57725 13.0654 8.21755 13.0654 7.86875C13.0654 7.51305 12.7849 7.28945 12.2887 7.28945H10.5958V8.57725ZM6.5059 4H10.0273V5.59685H7.3522V6.66695H9.7912V8.02775H7.3522V9.9983H10.0273V11.5568H6.5059V4Z" fill="white"/></svg>;
const GPayLogo: React.FC<{ className?: string }> = ({ className }) => <svg className={className} width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.45934 7.03913L6.95361 8.54077L7.26211 8.84105C7.94274 8.16327 8.94824 8.16327 9.62886 8.84105L10.3013 9.51061L9.93288 9.93902L9.26042 9.26946C8.92102 8.92134 8.41289 8.92134 8.07349 9.26946L6.55139 10.787L6.21564 10.4522L8.45934 7.03913Z" fill="#F4B400"/><path d="M12.1818 9.51061L11.8358 9.85549L10.3013 8.35384L10.637 8.01908L12.1818 9.51061Z" fill="#F4B400"/><path d="M5.19531 10.787L5.53928 11.1235L8.91373 7.76014L8.57798 7.42538L5.19531 10.787Z" fill="#F4B400"/><path d="M13.8436 9.85549L12.5175 11.1235L14.3162 12.8711L15.6423 11.603L13.8436 9.85549Z" fill="#DB4437"/><path d="M16.0334 11.603L15.6874 11.9479L12.2857 8.56729L12.6214 8.23253L16.0334 11.603Z" fill="#DB4437"/><path d="M6.16016 11.1235L5.85166 11.432L7.65039 13.2198L7.95067 12.9113L6.16016 11.1235Z" fill="#4285F4"/><path d="M8.0061 13.2198L7.6976 13.5283L11.1354 16L11.4794 15.6635L8.0061 13.2198Z" fill="#4285F4"/><path d="M11.8523 15.6635L11.4958 16L14.9335 12.8711L15.29 13.2198L11.8523 15.6635Z" fill="#0F9D58"/><path d="M17.4854 12.9113L17.1769 13.2198L14.6053 10.787L14.9513 10.4522L17.4854 12.9113Z" fill="#0F9D58"/><path d="M12.2857 0L7.6976 4.5796L12.2857 9.1923L21.4619 0H12.2857Z" fill="#4285F4"/><path d="M12.2857 9.1923L7.6976 13.7719L12.2857 18.3846L21.4619 9.1923L12.2857 9.1923Z" fill="#0F9D58"/><path d="M0 4.5796L4.5881 9.1923L9.1762 4.5796L4.5881 0L0 4.5796Z" fill="#F4B400"/><path d="M0 13.7719L4.5881 9.1923L9.1762 13.7719L4.5881 18.3846L0 13.7719Z" fill="#DB4437"/><path d="M28.016 11.7513H26.5186V5.45474H24.3129V4.20508H30.2217V5.45474H28.016V11.7513Z" fill="#5F6368"/><path d="M36.1951 8.01908C36.1951 9.54371 35.0441 10.5921 33.3768 10.5921C31.7095 10.5921 30.5585 9.54371 30.5585 8.01908C30.5585 6.49445 31.7095 5.44604 33.3768 5.44604C35.0441 5.44604 36.1951 6.49445 36.1951 8.01908ZM34.7059 8.01908C34.7059 7.10657 34.1491 6.43823 33.3768 6.43823C32.6045 6.43823 32.0477 7.10657 32.0477 8.01908C32.0477 8.93158 32.6045 9.6 33.3768 9.6C34.1491 9.6 34.7059 8.93158 34.7059 8.01908Z" fill="#5F6368"/><path d="M39.6738 11.9023V5.60571C39.6738 4.79382 39.117 4.20508 38.1659 4.20508C37.3854 4.20508 36.884 4.6781 36.7583 5.15112H35.4322C35.5346 4.14886 36.5672 3.23636 38.1659 3.23636C39.8496 3.23636 41.1757 4.13242 41.1757 5.75671V11.7513H39.6738V11.9023Z" fill="#5F6368"/></svg>;
const BhimLogo: React.FC<{ className?: string }> = ({ className }) => <svg className={className} width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.9984 11.232H11.5344V4.76H15.0544C16.8944 4.76 18.0144 5.928 18.0144 7.992C18.0144 10.064 16.8944 11.232 15.0544 11.232H12.9984ZM12.9984 9.96H15.0544C16.1424 9.96 16.7904 9.16 16.7904 7.992C16.7904 6.832 16.1424 6.032 15.0544 6.032H12.9984V9.96Z" fill="#F79521"/><path d="M22.016 11.232H18.72V4.76H22.016V6.032H20.184V7.2H21.8V8.464H20.184V9.96H22.016V11.232Z" fill="#005B9D"/><path d="M23.0132 11.232L24.8132 4.76H26.3812L24.5732 11.232H23.0132Z" fill="#F79521"/><path d="M0 11.4V4.592H3.72V5.864H1.464V7.472H3.504V8.744H1.464V10.128H3.888V11.4H0Z" fill="#005B9D"/><path d="M4.65625 11.4V4.592H6.12825V11.4H4.65625Z" fill="#005B9D"/><path d="M9.74331 11.4L7.00731 4.592H8.63131L10.5113 9.488L12.3913 4.592H13.9833L11.2473 11.4H9.74331Z" fill="#005B9D"/></svg>;

const PaytmUpiLogo: React.FC<{className?: string}> = ({className}) => (
    <div className={`flex items-center space-x-2 ${className}`}>
        <PaytmLogo className="h-4" />
        <span className="text-gray-400">|</span>
        <svg height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.93623 13.5V0.5H0.224227V13.5H2.93623Z" fill="#002E6E"></path>
            <path d="M11.6601 0.5H6.18811V13.5H8.90011V7.812L10.8201 13.5H13.6881L11.7081 7.656L14.0721 0.5H11.2041L10.0281 4.608L8.90011 0.5H11.6601Z" fill="#F89921"></path>
            <path d="M26.495 7C26.495 10.748 23.551 13.5 19.967 13.5C16.383 13.5 13.439 10.748 13.439 7C13.439 3.252 16.383 0.5 19.967 0.5C23.551 0.5 26.495 3.252 26.495 7ZM16.151 7C16.151 9.172 17.855 10.884 19.967 10.884C22.079 10.884 23.783 9.172 23.783 7C23.783 4.828 22.079 3.116 19.967 3.116C17.855 3.116 16.151 4.828 16.151 7Z" fill="#002E6E"></path>
            <path d="M27.9799 0.5L25.3279 5.64L25.6879 5.796C26.4319 6.156 26.8519 6.804 26.8519 7.668V13.5H29.6119V0.5H27.9799Z" fill="#F89921"></path>
        </svg>
    </div>
);


const PaytmPaymentView: React.FC<PaytmPaymentViewProps> = ({ amount, description, onSuccess, onFailure, onCancel }) => {
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'simulation'>('details');

  useEffect(() => {
    if (paymentStep === 'processing') {
      const timer = setTimeout(() => {
        setPaymentStep('simulation');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [paymentStep]);


  const renderContent = () => {
    switch(paymentStep) {
        case 'details':
            return (
                 <div className="bg-slate-100 rounded-lg p-4 pt-10 text-center relative shadow-inner">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 font-bold w-12 h-12 rounded-full flex items-center justify-center text-lg ring-4 ring-slate-100">
                        RH
                    </div>
                    <div className="flex items-center justify-center space-x-1.5 mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Rabial Haque</h2>
                        <VerifiedIcon className="w-5 h-5 text-blue-500" />
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden border-2 border-cyan-400 shadow-lg">
                        <div className="bg-cyan-400 p-2.5"></div>
                        <div className="p-4 pt-10 relative">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                <PaytmUpiLogo />
                            </div>
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3D7002444687%40ptyes%26pn%3DRabial%2520Haque&ecc=H&margin=0"
                                alt="Paytm QR Code"
                                className="w-48 h-48 mx-auto"
                            />
                            <p className="font-semibold text-orange-500 mt-3 text-sm flex items-center justify-center">
                                <span className="w-2 h-2 bg-orange-400 transform rotate-45 mr-2"></span>
                                7002444687@ptyes
                            </p>
                        </div>
                        <div className="bg-blue-900 p-2.5"></div>
                    </div>
                     <div className="mt-4">
                        <p className="text-sm text-gray-600 font-medium">Scan with any UPI app</p>
                        <div className="flex items-center justify-center space-x-4 mt-2 opacity-80">
                            <PaytmLogo className="h-5" />
                            <PhonePeLogoMini />
                            <GPayLogo />
                            <BhimLogo />
                        </div>
                    </div>
                </div>
            );
        case 'processing':
            return (
                <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Spinner color="text-blue-600"/>
                    <p className="text-lg font-semibold text-gray-700 mt-4">Processing Payment...</p>
                    <p className="text-sm text-gray-500">Please do not close this window.</p>
                </div>
            );
        case 'simulation':
             return (
                <div className="text-center min-h-[300px] flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Simulate Payment Result</h3>
                    <p className="text-sm text-gray-500 mb-6">Choose the outcome for this transaction.</p>
                    <div className="flex space-x-4">
                        <Button onClick={onSuccess} className="bg-green-500 hover:bg-green-600 focus:ring-green-400">
                            Simulate Success
                        </Button>
                        <Button onClick={onFailure} variant="danger">
                            Simulate Failure
                        </Button>
                    </div>
                </div>
            );
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <Card className="shadow-2xl w-full max-w-xs">
            <div className="p-4">
                {renderContent()}
            </div>
             <div className="p-4 pt-0 space-y-3">
                    {paymentStep === 'details' && (
                        <Button 
                            className="w-full bg-blue-500 hover:bg-blue-600 focus:ring-blue-400" 
                            onClick={() => setPaymentStep('processing')}
                        >
                            Pay ₹{amount.toLocaleString('en-IN')}
                        </Button>
                    )}
                    <Button 
                        variant="secondary" 
                        className="w-full" 
                        onClick={onCancel}
                        disabled={paymentStep === 'processing'}
                    >
                        Cancel
                    </Button>
                </div>
        </Card>
    </div>
  );
};

export default PaytmPaymentView;
