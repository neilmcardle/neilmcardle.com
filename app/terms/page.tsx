"use client"

import { Header } from '@/components/Header'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-gray max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <p className="text-gray-600 mb-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB')}
            </p>
            <p className="text-gray-500 text-sm mb-8">
              <a href="https://makeebook.ink" className="text-blue-600 hover:underline">makeEbook</a> is a product by Neil McArdle, operated under <a href="https://neilmcardle.com" className="text-blue-600 hover:underline">neilmcardle.com</a>.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using makeEbook at <a href="https://makeebook.ink" className="text-blue-600 hover:underline">makeebook.ink</a> ("the Service"), you agree to be bound by these Terms of Service
                and all applicable laws and regulations. If you do not agree with any of these terms, you are
                prohibited from using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                makeEbook is a free online tool that allows users to create, edit, and export eBooks. 
                The Service provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Rich text editing capabilities</li>
                <li>Chapter management tools</li>
                <li>eBook export functionality</li>
                <li>User account management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To use certain features of the Service, you must create an account by providing a valid email 
                address and password. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorised use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Content</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of all content you create using the Service. By using the Service, you represent that:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You own or have the necessary rights to all content you upload</li>
                <li>Your content does not infringe on any third-party rights</li>
                <li>Your content complies with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use the Service to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Create content that is illegal, harmful, or offensive</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to gain unauthorised access to the Service or other users' accounts</li>
                <li>Use the Service for any commercial purpose without permission</li>
                <li>Transmit malware, viruses, or other harmful code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Protection and Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal data is governed by our 
                <a href="/privacy" className="text-blue-600 hover:underline"> Privacy Policy</a>, 
                which forms part of these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain the availability of the Service but do not guarantee uninterrupted access. 
                The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the fullest extent permitted by law, makeEbook shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account at any time for violation of these Terms of Service. 
                You may terminate your account at any time by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service are governed by the laws of England and Wales. Any disputes arising 
                from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting. Your continued use of the Service constitutes acceptance of any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us through our website 
                at <a href="https://neilmcardle.com" className="text-blue-600 hover:underline">neilmcardle.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}