'use client';

import {
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  ShieldCheckIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export function DownloadApp() {
  return (
    <section className="relative py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-80 h-96">
              <DevicePhoneMobileIcon className="w-full h-full text-gray-200" />
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="font-inter text-4xl font-bold text-black mb-4">
              Take SaukiMart Everywhere
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our mobile app brings all the power of SaukiMart to your pocket.
              Fast, intuitive, and built for Nigerians.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <BoltIcon className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">
                  Instant transactions from anywhere
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">Bank-level security</span>
              </div>
              <div className="flex items-center gap-3">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">
                  Works on any Android device
                </span>
              </div>
              <div className="flex items-center gap-3">
                <WifiIcon className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">
                  Offline-ready with instant sync
                </span>
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => (window.location.href = '/download')}
                variant="primary"
                size="lg"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download APK
              </Button>
              <Button
                onClick={() =>
                  (window.location.href = 'https://play.google.com')
                }
                variant="secondary"
                size="lg"
              >
                Google Play
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
