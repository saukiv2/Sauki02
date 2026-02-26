'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div>
            <Image
              src="/logo_white.svg"
              alt="SaukiMart"
              width={140}
              height={35}
              className="h-auto mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Nigeria's trusted digital services platform. Buy data, pay bills, and shop with confidence.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-brand-blue flex-shrink-0" />
                <a href="tel:+2347044647081" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +234 704 464 7081
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-brand-blue flex-shrink-0" />
                <a href="tel:+2349024099561" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +234 902 409 9561
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-brand-blue flex-shrink-0" />
                <a href="mailto:support@saukimart.online" className="text-gray-400 hover:text-white transition-colors text-sm">
                  support@saukimart.online
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © {currentYear} SaukiMart by Anjal Ventures. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/2347044647081"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-brand-blue rounded-full flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-brand-blue rounded-full flex items-center justify-center transition-colors"
                title="Twitter/X"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-brand-blue rounded-full flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
