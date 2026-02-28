'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    pin: '',
    confirmPin: '',
    bvn: '',
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accountDetails, setAccountDetails] = useState<{
    accountNumber: string;
    bankName: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For PIN fields, only allow digits
    if (name === 'pin' || name === 'confirmPin') {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }
    
    // For BVN, only allow digits
    if (name === 'bvn') {
      if (!/^\d*$/.test(value) || value.length > 11) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    setError('');

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10-15 digits');
      return false;
    }

    if (formData.pin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return false;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return false;
    }

    if (formData.bvn.length !== 11) {
      setError('BVN must be exactly 11 digits');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          pin: formData.pin,
          bvn: formData.bvn.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('[Register] Success:', data);
      setAccountDetails(data.wallet);
      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success && accountDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-gray-600 mb-3 font-semibold">YOUR VIRTUAL ACCOUNT</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Account Number</p>
                <p className="text-lg font-mono font-bold text-gray-900">{accountDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Bank Name</p>
                <p className="text-sm font-semibold text-gray-900">{accountDetails.bankName}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Keep this account number. Transfer money here to fund your wallet.
            </p>
          </div>

          <p className="text-gray-600 mb-2">Your account is active and ready to use!</p>
          <p className="text-sm text-gray-500 animate-pulse">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/logo.svg"
              alt="SaukiMart"
              width={120}
              height={40}
              className="h-10 mx-auto"
              priority
            />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Create Account</h1>
            <p className="text-gray-600 text-sm mt-2">Join SaukiMart today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Used for login</p>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Use this to login and confirm payments</p>
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <div className="relative">
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  name="confirmPin"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* BVN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BVN (11 digits)
              </label>
              <input
                type="text"
                name="bvn"
                value={formData.bvn}
                onChange={handleChange}
                placeholder="12345678901"
                maxLength={11}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                <span className="text-yellow-600 font-bold">⚠️</span>
                <span>Never stored - only used to create your virtual account</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">Already have account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link href="/auth/login" className="text-brand-blue hover:text-blue-700 font-semibold">
              Sign in instead
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8">
            By registering, you agree to our{' '}
            <Link href="/terms" className="text-brand-blue hover:underline">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-blue hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <p className="text-center text-white text-sm mt-8">
          © 2024 SaukiMart. All rights reserved.
        </p>
      </div>
    </div>
  );
}
