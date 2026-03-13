import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for the E-Summit app by E-Cell MNIT Jaipur. Learn how we collect, use, and protect your data.',
    alternates: {
        canonical: '/esummit/privacy-policy',
    },
};

export default function PrivacyPolicyPage() {
    const lastUpdated = 'March 13, 2025';
    const appName = 'E-Summit';
    const orgName = 'E-Cell MNIT Jaipur';
    const contactEmail = 'ecell@mnit.ac.in';
    const website = 'https://www.ecellmnit.org/esummit';

    return (
        <div className="min-h-screen text-white py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                    >
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Last updated: <span className="text-orange-400">{lastUpdated}</span>
                    </p>
                    <div className="mt-4 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
                </div>

                {/* Intro */}
                <Section>
                    <p className="text-gray-300 leading-relaxed">
                        Welcome to the <strong className="text-white">{appName}</strong> mobile application (&quot;App&quot;) operated by{' '}
                        <strong className="text-white">{orgName}</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). This Privacy
                        Policy explains how we collect, use, disclose, and safeguard your information when you use our App and
                        related services. Please read this policy carefully. By using the App, you agree to the terms described
                        below.
                    </p>
                </Section>

                {/* 1. Information We Collect */}
                <Section title="1. Information We Collect">
                    <SubHeading>1.1 Information You Provide</SubHeading>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong className="text-white">Account Information:</strong> Name, email address, phone number, college/institution name, and year of study when you register.</li>
                        <li><strong className="text-white">Profile Information:</strong> Optional profile photo, biography, or other details you choose to provide.</li>
                        <li><strong className="text-white">Event Registration Data:</strong> Details you submit when registering for events, competitions, or workshops.</li>
                        <li><strong className="text-white">Payment Information:</strong> Transaction details for pass purchases (processed securely by third-party payment providers; we do not store card details).</li>
                    </ul>

                    <SubHeading>1.2 Information Collected Automatically</SubHeading>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong className="text-white">Device Information:</strong> Device type, operating system version, and unique device identifiers.</li>
                        <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent in the App, and interaction logs.</li>
                        <li><strong className="text-white">Log Data:</strong> IP address, app version, crash reports, and diagnostic data.</li>
                    </ul>

                    <SubHeading>1.3 Permissions We Request</SubHeading>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong className="text-white">Camera:</strong> Used for QR code scanning at event check-ins.</li>
                        <li><strong className="text-white">Internet:</strong> Required for all App functionality.</li>
                    </ul>
                </Section>

                {/* 2. How We Use Your Information */}
                <Section title="2. How We Use Your Information">
                    <p className="text-gray-300 leading-relaxed mb-3">We use the information we collect to:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>Create and manage your account and event registrations.</li>
                        <li>Process payments and issue event passes or tickets.</li>
                        <li>Send you transactional notifications, event reminders, and updates.</li>
                        <li>Verify your identity at event entry via QR code check-in.</li>
                        <li>Improve App performance, fix bugs, and develop new features.</li>
                        <li>Comply with legal obligations and enforce our Terms of Service.</li>
                        <li>Conduct analytics to understand how the App is used.</li>
                    </ul>
                </Section>

                {/* 3. Sharing Your Information */}
                <Section title="3. Sharing Your Information">
                    <p className="text-gray-300 leading-relaxed mb-3">
                        We do <strong className="text-white">not sell</strong> your personal information. We may share it only in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong className="text-white">Service Providers:</strong> Third-party vendors (e.g., Supabase for database/auth, Razorpay/UPI payment gateways) that process data on our behalf under strict confidentiality agreements.</li>
                        <li><strong className="text-white">Event Partners:</strong> Organizers of specific events you register for may receive your name and contact for coordination purposes.</li>
                        <li><strong className="text-white">Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
                        <li><strong className="text-white">Safety:</strong> To protect the rights, property, or safety of our users or the public.</li>
                    </ul>
                </Section>

                {/* 4. Data Storage & Security */}
                <Section title="4. Data Storage & Security">
                    <p className="text-gray-300 leading-relaxed">
                        Your data is stored on secure cloud servers (Supabase). We implement industry-standard technical and
                        organizational measures — including encryption in transit (TLS) and at rest — to protect your personal
                        information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee
                        absolute security.
                    </p>
                </Section>

                {/* 5. Data Retention */}
                <Section title="5. Data Retention">
                    <p className="text-gray-300 leading-relaxed">
                        We retain your personal data for as long as your account is active or as needed to provide services. You
                        may request deletion of your account and associated data at any time by contacting us at{' '}
                        <a href={`mailto:${contactEmail}`} className="text-orange-400 underline hover:text-orange-300">
                            {contactEmail}
                        </a>
                        . We will delete your data within 30 days of a verified request, except where retention is required by law.
                    </p>
                </Section>

                {/* 6. Children's Privacy */}
                <Section title="6. Children's Privacy">
                    <p className="text-gray-300 leading-relaxed">
                        The App is intended for users who are at least <strong className="text-white">13 years of age</strong>. We do not
                        knowingly collect personal information from children under 13. If we become aware that a child under 13 has
                        provided us with personal information, we will take steps to delete such information promptly.
                    </p>
                </Section>

                {/* 7. Third-Party Links */}
                <Section title="7. Third-Party Links & Services">
                    <p className="text-gray-300 leading-relaxed">
                        The App may contain links to external event registration pages, sponsor websites, or social media platforms.
                        We are not responsible for the privacy practices of those third parties. We encourage you to review their
                        privacy policies before providing any personal information.
                    </p>
                </Section>

                {/* 8. Your Rights */}
                <Section title="8. Your Rights">
                    <p className="text-gray-300 leading-relaxed mb-3">Depending on your location, you may have the right to:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>Access the personal data we hold about you.</li>
                        <li>Request correction of inaccurate data.</li>
                        <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
                        <li>Withdraw consent for optional data processing at any time.</li>
                        <li>Lodge a complaint with a data protection authority.</li>
                    </ul>
                    <p className="text-gray-300 leading-relaxed mt-3">
                        To exercise any of these rights, contact us at{' '}
                        <a href={`mailto:${contactEmail}`} className="text-orange-400 underline hover:text-orange-300">
                            {contactEmail}
                        </a>.
                    </p>
                </Section>

                {/* 9. Changes to Policy */}
                <Section title="9. Changes to This Privacy Policy">
                    <p className="text-gray-300 leading-relaxed">
                        We may update this Privacy Policy from time to time. When we make material changes, we will update the
                        &quot;Last updated&quot; date at the top of this page and notify you through the App or via email. Your
                        continued use of the App after changes constitutes acceptance of the revised policy.
                    </p>
                </Section>

                {/* 10. Contact Us */}
                <Section title="10. Contact Us">
                    <p className="text-gray-300 leading-relaxed">
                        If you have any questions or concerns about this Privacy Policy, please contact us:
                    </p>
                    <div className="mt-4 p-5 rounded-xl border border-orange-500/30 bg-orange-500/5 space-y-2">
                        <p className="text-white font-semibold">{orgName}</p>
                        <p className="text-gray-300">
                            Email:{' '}
                            <a href={`mailto:${contactEmail}`} className="text-orange-400 underline hover:text-orange-300">
                                {contactEmail}
                            </a>
                        </p>
                        <p className="text-gray-300">
                            Website:{' '}
                            <a href={website} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline hover:text-orange-300">
                                {website}
                            </a>
                        </p>
                        <p className="text-gray-300">
                            Address: Malaviya National Institute of Technology, JLN Marg, Jaipur, Rajasthan — 302017, India
                        </p>
                    </div>
                </Section>
            </div>
        </div>
    );
}

/* ── Reusable sub-components ── */

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            {title && (
                <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-orange-500 pl-4">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}

function SubHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-base font-semibold text-orange-300 mt-5 mb-2">{children}</h3>
    );
}
