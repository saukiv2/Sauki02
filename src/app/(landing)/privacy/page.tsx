import Image from 'next/image';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-10">
        <Image src="/logo.svg" alt="SaukiMart" width={160} height={40} className="mb-4" />
        <h1 className="font-playfair text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500">Last updated: February 2026</p>
      </div>
      <nav className="mb-10 border rounded-lg bg-gray-50 p-6">
        <h2 className="font-semibold mb-3 text-lg">Table of Contents</h2>
        <ol className="list-decimal ml-6 space-y-1 text-brand-blue">
          <li><a href="#introduction">Introduction</a></li>
          <li><a href="#info-we-collect">Information We Collect</a></li>
          <li><a href="#not-collect">What We DO NOT Collect</a></li>
          <li><a href="#use-of-info">How We Use Your Information</a></li>
          <li><a href="#security">Data Security</a></li>
          <li><a href="#third-party">Third-Party Services</a></li>
          <li><a href="#your-rights">Your Rights</a></li>
          <li><a href="#cookies">Cookies</a></li>
          <li><a href="#changes">Changes to This Policy</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ol>
      </nav>
      <section id="introduction" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">1. Introduction</h2>
        <p>SaukiMart is operated by Anjal Ventures (CAC BN 9258709).<br />
        Contact: <a href="mailto:support@saukimart.online" className="text-brand-blue">support@saukimart.online</a> | +2347044647081 | +2349024099561</p>
      </section>
      <section id="info-we-collect" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">2. Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Name, email, phone number on registration</li>
          <li>BVN verification reference token (NOT the BVN number itself)</li>
          <li>Transaction records (data purchases, electricity bills, orders)</li>
          <li>Device tokens for Android push notifications</li>
          <li>Wallet balance and transfer history</li>
        </ul>
      </section>
      <section id="not-collect" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">3. What We DO NOT Collect</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Your BVN number (sent directly to Flutterwave, never stored by us)</li>
          <li>Bank card numbers (processed by Flutterwave, never stored by us)</li>
          <li>NIN or any other government ID</li>
        </ul>
      </section>
      <section id="use-of-info" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">4. How We Use Your Information</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Process wallet funding, data purchases, electricity payments, gadget orders</li>
          <li>Send transaction notifications (SMS, push notifications on Android)</li>
          <li>Verify your identity for CBN fintech compliance</li>
          <li>Provide customer support</li>
        </ul>
      </section>
      <section id="security" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">5. Data Security</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Passwords hashed with bcrypt (never stored in plain text)</li>
          <li>JWT tokens with 15-minute expiry</li>
          <li>All connections over HTTPS (TLS 1.3)</li>
          <li>Wallet operations use atomic database transactions</li>
          <li>Flutterwave webhook verified with HMAC-SHA256 signature</li>
        </ul>
      </section>
      <section id="third-party" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">6. Third-Party Services</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Flutterwave (payment processing, BVN verification, virtual accounts)</li>
          <li>Interswitch Quickteller (electricity bill payments)</li>
          <li>Firebase (Android push notifications only)</li>
          <li>AWS EC2 (data vending API proxy)</li>
        </ul>
      </section>
      <section id="your-rights" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">7. Your Rights</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Request deletion of your account</li>
          <li>Download your transaction history</li>
          <li>Update your personal information</li>
        </ul>
        <p>Contact: <a href="mailto:support@saukimart.online" className="text-brand-blue">support@saukimart.online</a></p>
      </section>
      <section id="cookies" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">8. Cookies</h2>
        <p>We use only essential session cookies (JWT refresh token in HTTP-only cookie).<br />No advertising cookies. No tracking cookies.</p>
      </section>
      <section id="changes" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">9. Changes to This Policy</h2>
        <p>We will notify registered users via email and in-app notification of material changes.</p>
      </section>
      <section id="contact" className="mb-8">
        <h2 className="font-bold text-2xl mb-2">10. Contact Us</h2>
        <p>
          Anjal Ventures<br />
          Email: <a href="mailto:support@saukimart.online" className="text-brand-blue">support@saukimart.online</a><br />
          Phone: +2347044647081 | +2349024099561<br />
          CAC BN 9258709 | TIN: 2623553716975
        </p>
      </section>
    </main>
  );
}
