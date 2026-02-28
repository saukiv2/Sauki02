'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-gray-50 text-gray-600 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div>
            <Image
              src="/logo.svg"
              alt="SaukiMart"
              width={140}
              height={35}
              className="h-auto mb-4"
            />
            <p className="text-sm leading-relaxed">
              Nigeria's trusted digital services platform. Buy data, pay bills,
              and shop with confidence.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-black mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-black transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-black transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-black transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-black mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-black transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-black transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-black mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />
                <a
                  href="tel:+2347044647081"
                  className="hover:text-black transition-colors text-sm"
                >
                  +234 704 464 7081
                </a>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                <a
                  href="mailto:support@saukimart.online"
                  className="hover:text-black transition-colors text-sm"
                >
                  support@saukimart.online
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-sm">
              © {currentYear} SaukiMart by Anjal Ventures. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
