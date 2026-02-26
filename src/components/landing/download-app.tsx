'use client';

import { Download, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function DownloadApp() {
  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-80 h-96 bg-black rounded-3xl p-3 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl z-10" />
              {/* Screen */}
              <div className="w-full h-full bg-gradient-to-b from-brand-blue to-blue-700 rounded-3xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Smartphone size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">SaukiMart App</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="font-playfair text-4xl font-bold text-black mb-4">
              Take SaukiMart Everywhere
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our mobile app brings all the power of SaukiMart to your pocket. Fast, intuitive, and built for Nigerians.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <span className="text-gray-700">Instant transactions from anywhere</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <span className="text-gray-700">Bank-level security</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <span className="text-gray-700">Works on any Android device</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🆗</span>
                <span className="text-gray-700">Offline-ready with instant sync</span>
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/download"
                className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                <Download size={20} />
                Download APK
              </Link>
              <Link
                href="https://play.google.com"
                target="_blank"
                className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                Google Play
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
