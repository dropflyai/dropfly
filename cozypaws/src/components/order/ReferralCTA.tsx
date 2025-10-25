'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function ReferralCTA() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=COZY10`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success('Referral link copied to clipboard!');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSending(true);
    try {
      // Mock email sending - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Referral sent to ${email}!`);
      setEmail('');
    } catch {
      toast.error('Failed to send referral. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg shadow-lg p-8 text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Give $10, Get $10</h2>
        <p className="mt-2 text-orange-50">
          Share CozyPaws with friends and you both save on your next order!
        </p>
      </div>

      <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Copy Link */}
          <div className="flex-1">
            <label htmlFor="referral-link" className="block text-sm font-medium text-orange-50 mb-2">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="referral-link"
                value={referralUrl}
                readOnly
                className="block w-full rounded-md border-0 bg-white bg-opacity-90 px-3 py-2 text-gray-900 text-sm font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm hover:bg-orange-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Email Invite */}
        <form onSubmit={handleSendEmail} className="mt-4">
          <label htmlFor="referral-email" className="block text-sm font-medium text-orange-50 mb-2">
            Or Send via Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              id="referral-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="block w-full rounded-md border-0 bg-white bg-opacity-90 px-3 py-2 text-gray-900 text-sm placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-orange-600 shadow-sm hover:bg-orange-50 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* Social Share Buttons */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <p className="text-sm text-orange-50">Share on:</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out CozyPaws Outlet for discount pet supplies!&url=${referralUrl}`, '_blank')}
            className="rounded-full bg-white bg-opacity-20 p-2 hover:bg-opacity-30 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </button>
          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${referralUrl}`, '_blank')}
            className="rounded-full bg-white bg-opacity-20 p-2 hover:bg-opacity-30 transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
