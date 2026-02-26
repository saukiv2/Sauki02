import Image from 'next/image';

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-10">
        <Image src="/logo.svg" alt="SaukiMart" width={160} height={40} className="mb-4" />
        <h1 className="font-playfair text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500">Last updated: February 2026</p>
      </div>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">1. Acceptance</h2>
        <p>By using SaukiMart, you agree to these Terms of Service and our Privacy Policy.</p>
      </section>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">2. Services</h2>
        <p>SaukiMart provides digital wallet, data vending, bill payment, and e-commerce services to users in Nigeria.</p>
      </section>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">3. Wallet Terms</h2>
        <p>Your wallet balance is held in trust and can be used for purchases or withdrawn to your bank account. All wallet operations are subject to CBN regulations.</p>
      </section>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">4. Agent Terms</h2>
        <p>Agents must comply with all KYC requirements and are responsible for their customers' transactions. Commissions are paid on successful transactions only.</p>
      </section>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">5. Prohibited Uses</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Money laundering, fraud, or illegal activities</li>
          <li>Sharing your account with others</li>
          <li>Attempting to hack or disrupt the platform</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">6. Limitation of Liability</h2>
        <p>SaukiMart and Anjal Ventures are not liable for indirect, incidental, or consequential damages. Maximum liability is limited to the amount in your wallet.</p>
      </section>
      <section className="mb-8">
        <h2 className="font-bold text-2xl mb-2">7. Contact</h2>
        <p>
          Anjal Ventures<br />
          Email: <a href="mailto:support@saukimart.online" className="text-brand-blue">support@saukimart.online</a><br />
          Phone: +2347044647081 | +2349024099561<br />
          CAC BN 9258709
        </p>
      </section>
    </main>
  );
}
