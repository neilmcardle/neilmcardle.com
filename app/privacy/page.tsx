"use client"

import { Header } from '@/components/Header'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-gray max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <p className="text-gray-600 mb-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB')}
            </p>
            <p className="text-gray-500 text-sm mb-8">
              <a href="https://makeebook.ink" className="text-blue-600 hover:underline">makeEbook</a> is a product by Neil McArdle, operated under <a href="https://neilmcardle.com" className="text-blue-600 hover:underline">neilmcardle.com</a>.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Controller Information</h2>
              <p className="text-gray-700 mb-4">
                The data controller for <a href="https://makeebook.ink" className="text-blue-600 hover:underline">makeEbook</a> is Neil McArdle, operating as an individual under UK GDPR.
                For any privacy-related inquiries, please contact us through
                <a href="https://neilmcardle.com" className="text-blue-600 hover:underline"> neilmcardle.com</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Email address, password (encrypted)</li>
                <li><strong>eBook Content:</strong> Text, titles, chapters, and any content you create</li>
                <li><strong>Optional Information:</strong> Username or display name if provided</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Usage Data:</strong> How you interact with the service, features used</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Authentication Data:</strong> Login sessions and security tokens</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="text-gray-700 mb-4">
                We process your personal data based on the following legal grounds under UK GDPR:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Contract Performance:</strong> To provide the eBook creation service you've requested</li>
                <li><strong>Legitimate Interests:</strong> To improve our service, prevent fraud, and ensure security</li>
                <li><strong>Consent:</strong> For any additional features or communications (where explicitly given)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>To provide and maintain the eBook creation service</li>
                <li>To manage your user account and authentication</li>
                <li>To store and process your eBook content</li>
                <li>To communicate with you about the service</li>
                <li>To improve our service and fix technical issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Recipients</h2>
              <p className="text-gray-700 mb-4">
                We share your personal data only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> Supabase (database hosting), Vercel (application hosting)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>With Your Consent:</strong> Any other sharing only with your explicit permission</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We do not sell, rent, or trade your personal data to third parties for marketing purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal data for as long as necessary to provide the service and fulfill our legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
                <li><strong>eBook Content:</strong> Until you delete it or close your account</li>
                <li><strong>Usage Logs:</strong> Maximum of 12 months for security and improvement purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights Under UK GDPR</h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise any of these rights, please contact us through our website. We will respond within one month.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your data may be processed outside the UK through our service providers (Supabase, Vercel). 
                We ensure appropriate safeguards are in place through:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Standard Contractual Clauses approved by UK authorities</li>
                <li>Service providers' compliance with international data protection standards</li>
                <li>Regular review of transfer mechanisms and safeguards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organisational measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use essential cookies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Ensure security of the service</li>
              </ul>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the service to function and are set based on contractual necessity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal data from children under 13. If you believe we have collected such data, 
                please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any significant 
                changes by email or through the service. Your continued use after such changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Complaints</h2>
              <p className="text-gray-700 mb-4">
                If you have concerns about how we handle your personal data, you can:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Contact us directly through our website</li>
                <li>Lodge a complaint with the Information Commissioner's Office (ICO) at 
                  <a href="https://ico.org.uk" className="text-blue-600 hover:underline"> ico.org.uk</a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For any questions about this Privacy Policy or to exercise your data protection rights, 
                please contact us through <a href="https://neilmcardle.com" className="text-blue-600 hover:underline">neilmcardle.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}