import React, { useState, useEffect, useCallback } from 'react';
import { STATIC_QUOTES, BRAND_COLORS_LIST } from './constants';

type AppStep = 'landing' | 'input' | 'result';

export default function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [name, setName] = useState('');
  const [currentQuote, setCurrentQuote] = useState(STATIC_QUOTES[0].text);
  const [qrUrl, setQrUrl] = useState('');

  // --- Initialization & Deep Link Logic ---
  useEffect(() => {
    try {
      // 1. Determine the Base URL (stripped of params)
      const url = new URL(window.location.href);
      const baseUrl = `${url.origin}${url.pathname}`;
      
      // 2. generate the link for students (appends ?mode=student)
      const studentLink = `${baseUrl}?mode=student`;
      
      // 3. Generate the QR code image URL pointing to that student link
      // We use a darker color for the QR dots (#4A4E69) to match the theme
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(studentLink)}&color=4A4E69&bgcolor=F7F3E8&margin=10`;
      setQrUrl(qrImage);

      // 4. Check if WE are the student (did we arrive via the link?)
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'student') {
        setStep('input');
      }
    } catch (e) {
      console.error("Initialization error:", e);
    }
  }, []);

  // --- Confetti Logic ---
  const triggerConfetti = useCallback(() => {
    if (window.confetti) {
      // 1. Center burst
      window.confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.6 },
        colors: BRAND_COLORS_LIST,
        zIndex: 1000,
        scalar: 1.2,
        ticks: 200, // Stay on screen longer
        gravity: 0.8,
      });
      
      // 2. Left and Right "Cannons" for a big pop effect
      const end = Date.now() + 1000;
      const colors = BRAND_COLORS_LIST;

      (function frame() {
        window.confetti && window.confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors
        });
        window.confetti && window.confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, []);

  // --- Quote Logic ---
  const getRandomStaticQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * STATIC_QUOTES.length);
    setCurrentQuote(STATIC_QUOTES[randomIndex].text);
  }, []);

  // Auto-reset effect when on result screen
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'result') {
      timer = setTimeout(() => {
        setName('');
        // If we are in "student mode" (on a phone), we probably want to go back to input, not the QR code
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'student') {
            setStep('input');
        } else {
            setStep('landing');
        }
      }, 15000); // Reset after 15 seconds automatically
    }
    return () => clearTimeout(timer);
  }, [step]);


  // --- Input Logic ---
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    getRandomStaticQuote();
    setStep('result');
    // Use a small timeout to let the DOM render the result view before popping confetti
    setTimeout(triggerConfetti, 300);
  };

  // --- Render Helpers ---

  // 1. Landing Screen (The Scanner Image)
  const renderLanding = () => (
    <div className="animate-fade-in-up w-full flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="mb-8 p-4 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-4 border-[#F7E1D7] relative animate-float">
        {/* Dynamic QR Code pointing to this site */}
        {qrUrl ? (
             <img 
             src={qrUrl} 
             alt="Scan to Start" 
             className="w-64 h-64 rounded-lg mix-blend-multiply"
           />
        ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">Loading QR...</div>
        )}
      </div>

      <h1 className="text-5xl font-serif text-[#4A4E69] mb-4 tracking-tight">
        Scan to Start
      </h1>
      <p className="text-[#9A8C98] mb-12 text-lg font-light max-w-sm leading-relaxed">
        Point your camera at the QR code to receive your daily message of inspiration.
      </p>

      {/* Manual Entry Fallback */}
      <div className="relative group">
        <button
            onClick={() => setStep('input')}
            className="text-[#84A59D] font-medium text-sm border-b border-[#84A59D]/30 pb-0.5 hover:text-[#6D8A83] hover:border-[#6D8A83] transition-colors"
        >
            Or click here to enter manually
        </button>
      </div>
    </div>
  );

  // 2. Input Screen
  const renderInput = () => (
    <div className="animate-fade-in-up w-full flex flex-col items-center justify-center min-h-[50vh]">
      
      {/* Decorative Icon */}
      <div className="mb-6 p-6 bg-[#F7E1D7]/50 rounded-full shadow-[0_4px_20px_rgba(242,132,130,0.2)]">
         <svg className="w-12 h-12 text-[#F28482]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
      </div>

      <h1 className="text-4xl font-serif text-[#4A4E69] text-center mb-3 tracking-tight">
        Discover Your Message
      </h1>
      <p className="text-[#9A8C98] text-center mb-10 text-base font-light max-w-xs leading-relaxed">
        A moment of inspiration has been chosen just for you.
      </p>
      
      <form onSubmit={handleUnlock} className="flex flex-col gap-5 w-full max-w-xs relative z-10">
        <div className="relative group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-5 text-xl text-center bg-white border-2 border-[#F7E1D7] rounded-2xl focus:outline-none focus:border-[#F28482] focus:ring-4 focus:ring-[#F28482]/10 transition-all placeholder-[#DBC9C6] text-[#4A4E69] shadow-sm group-hover:shadow-md"
            autoFocus
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-[#F28482] text-white font-medium py-4 rounded-xl shadow-lg hover:bg-[#E57371] hover:shadow-[#F28482]/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide disabled:hover:translate-y-0 disabled:hover:shadow-lg animate-heartbeat"
        >
          Reveal My Quote
        </button>

        <button 
            type="button" 
            onClick={() => setStep('landing')}
            className="text-[#9A8C98] text-sm hover:text-[#4A4E69] transition-colors mt-2 text-center"
        >
            ← Back to Scanner
        </button>
      </form>
    </div>
  );

  // 3. Result Screen
  const renderResult = () => (
    <div className="flex flex-col items-center text-center animate-scale-in w-full py-6 min-h-[50vh] justify-center">
      <div className="mb-6 animate-fade-in delay-100">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#F6BD60]/20 text-[#D49E45] text-xs font-bold tracking-widest uppercase border border-[#F6BD60]/20">
          Selected for you
        </span>
      </div>
      
      <h2 className="text-4xl font-serif text-[#4A4E69] mb-10 animate-fade-in delay-200">
        Hi, <span className="text-[#F28482] italic border-b-2 border-[#F28482]/30 pb-1 pr-2">{name}</span>
      </h2>
      
      <div className="relative p-10 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#fff] mb-12 w-full max-w-sm transform transition-all duration-500 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.15)] animate-fade-in-up delay-300">
        <div className="absolute -top-6 -left-4 text-8xl text-[#84A59D] opacity-20 font-serif leading-none select-none">“</div>
        <p className="text-2xl text-[#4A4E69] leading-relaxed font-serif relative z-10 font-medium">
          {currentQuote}
        </p>
        <div className="absolute -bottom-10 -right-4 text-8xl text-[#84A59D] opacity-20 font-serif leading-none select-none">”</div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F6BD60]/10 to-transparent rounded-tr-[2rem]"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#F28482]/10 to-transparent rounded-bl-[2rem]"></div>
      </div>
      
      {/* Subtle progress bar indicating auto-reset */}
      <div className="flex flex-col items-center gap-3 animate-fade-in delay-500 opacity-80">
        <div className="w-48 h-1 bg-[#E7ECEF] rounded-full overflow-hidden">
          <div className="h-full bg-[#84A59D] animate-[scan_15s_linear_forwards] w-full origin-left"></div>
        </div>
        <p className="text-[#9A8C98] text-xs font-medium tracking-wide">Refreshing for the next student...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-[#F7F3E8]">
      
      {/* Decorative Background Blob - Top Right */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#F5CAC3] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      {/* Decorative Background Blob - Bottom Left */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#84A59D] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      {/* Decorative Background Blob - Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F6BD60] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Main Card Container */}
      <main className="w-full max-w-lg relative z-10 flex flex-col justify-center">
        {step === 'landing' && renderLanding()}
        {step === 'input' && renderInput()}
        {step === 'result' && renderResult()}
      </main>
      
    </div>
  );
}