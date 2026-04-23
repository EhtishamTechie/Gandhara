// src/pages/PrivacyPolicyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon, LockClosedIcon, DocumentTextIcon, CameraIcon, GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-repeat" style={{ 
            backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" 
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Privacy Policy</h1>
            <div className="w-24 h-1 bg-[#E6A44E] rounded-full mb-6"></div>
            <p className="text-[#E2E8F0] text-lg max-w-2xl text-center">
              How we protect and handle your personal information when you visit our website, book tours, or purchase products
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-[#E6A44E] transition-colors">Home</Link>
            <span className="mx-2">•</span>
            <span className="text-gray-800 font-medium">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/" className="inline-flex items-center text-[#1E293B] hover:text-[#E6A44E] mb-8 transition-colors">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            <span>Back to Home</span>
          </Link>
          
          {/* Introduction */}
          <section className="mb-10">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold text-[#1E293B]">Privacy Policy Overview</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              At Gandhara Taxila, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your data when you interact with our website, book tours, or purchase products.
            </p>
            <p className="text-gray-700">
              By using our website and services, you consent to the data practices described in this policy. We encourage you to read this policy carefully to understand our practices regarding your personal information.
            </p>
            
            <div className="bg-[#1E293B]/5 rounded-lg p-4 mt-6 border-l-4 border-[#E6A44E]">
              <p className="text-gray-700 italic">
                Last updated: May 11, 2025
              </p>
            </div>
          </section>
          
          {/* Information We Collect */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold text-[#1E293B]">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Personal Information</h3>
                <p className="text-gray-700 mb-3">
                  We may collect the following personal information when you use our website, book a tour, or make a purchase:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Name, email address, phone number, and billing/shipping address</li>
                  <li>Payment information (though payment card details are processed securely by our payment processors and are not stored on our servers)</li>
                  <li>Tour preferences, special requirements, and booking details</li>
                  <li>Communication preferences and marketing opt-ins</li>
                  <li>Content of your communications with us through email, WhatsApp, or other channels</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Information Collected Automatically</h3>
                <p className="text-gray-700 mb-3">
                  When you visit our website, we may automatically collect certain information about your device and usage, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>IP address, browser type, operating system, and device information</li>
                  <li>Pages visited, time spent on pages, links clicked, and other browsing behavior</li>
                  <li>Referral sources and website navigation patterns</li>
                  <li>Location information (if you've granted permission)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Cookies and Similar Technologies</h3>
                <p className="text-gray-700 mb-3">
                  We use cookies and similar tracking technologies to enhance your experience on our website and collect information about how you interact with our services. These technologies help us:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our website</li>
                  <li>Improve our services and user experience</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Measure the effectiveness of our marketing efforts</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  You can manage your cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our website.
                </p>
              </div>
            </div>
          </section>
          
          {/* How We Use Your Information */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <GlobeAltIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold text-[#1E293B]">How We Use Your Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Providing and Improving Our Services</h3>
                <p className="text-gray-700 mb-3">
                  We use your personal information to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Process and confirm tour bookings</li>
                  <li>Fulfill product orders and process payments</li>
                  <li>Communicate with you about your bookings, purchases, or inquiries</li>
                  <li>Provide customer support and respond to your requests</li>
                  <li>Improve our website, tours, and products based on your feedback and interactions</li>
                  <li>Develop new features and offerings that may interest you</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Marketing and Communications</h3>
                <p className="text-gray-700 mb-3">
                  With your consent, we may use your information to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Send you newsletters, promotions, and information about new tours or products</li>
                  <li>Personalize your experience and deliver content relevant to your interests</li>
                  <li>Conduct surveys and collect feedback to improve our services</li>
                  <li>Invite you to events or special promotions related to Taxila heritage</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  You can opt out of marketing communications at any time by clicking the "unsubscribe" link in our emails or contacting us directly.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Legal and Security Purposes</h3>
                <p className="text-gray-700 mb-3">
                  We may also use your information to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Comply with legal obligations and respond to legal requests</li>
                  <li>Protect our rights, property, or safety, or that of our users</li>
                  <li>Detect, investigate, and prevent fraudulent transactions or other illegal activities</li>
                  <li>Enforce our terms of service and other agreements</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Information Sharing and Data Security */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <LockClosedIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold text-[#1E293B]">Information Sharing and Data Security</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">When We Share Your Information</h3>
                <p className="text-gray-700 mb-3">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes. We may share your information with:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Service providers who help us operate our business (payment processors, shipping companies, tour guides, IT service providers)</li>
                  <li>Business partners with whom we offer co-branded services or joint marketing promotions, with your consent</li>
                  <li>Legal authorities when required by law, to protect our rights, or in response to a legal process</li>
                  <li>A successor entity in the event of a merger, acquisition, or sale of all or part of our business</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Any third parties with whom we share your information are contractually required to maintain its confidentiality and security.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Data Security</h3>
                <p className="text-gray-700 mb-3">
                  We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Secure network configurations and firewalls</li>
                  <li>Regular security assessments and vulnerability scanning</li>
                  <li>Staff training on data protection and security practices</li>
                  <li>Access controls and authentication mechanisms</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  While we take all reasonable steps to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to implementing best practices to safeguard your data.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Data Retention</h3>
                <p className="text-gray-700">
                  We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements. When determining the appropriate retention period, we consider the nature and sensitivity of the data, potential risks, and applicable legal requirements.
                </p>
              </div>
            </div>
          </section>
          
          {/* Your Rights and Choices */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold text-[#1E293B]">Your Rights and Choices</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Your Privacy Rights</h3>
                <p className="text-gray-700 mb-3">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information in certain circumstances</li>
                  <li>Restrict or object to the processing of your information</li>
                  <li>Data portability (receiving your data in a structured, commonly used format)</li>
                  <li>Withdraw consent at any time for processing based on consent</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  To exercise these rights, please contact us using the information provided in the "Contact Us" section below. We will respond to your request within the timeframe required by applicable law.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Marketing Preferences</h3>
                <p className="text-gray-700">
                  You can control how we communicate with you by updating your preferences in your account settings, clicking the "unsubscribe" link in our marketing emails, or contacting us directly. Even if you opt out of marketing communications, we may still send you important administrative messages about your bookings, purchases, or account.
                </p>
              </div>
            </div>
          </section>
          
          {/* Photography and Social Media Policy */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <CameraIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold text-[#1E293B]">Photography and Social Media Policy</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Tour Photography</h3>
                <p className="text-gray-700 mb-3">
                  During our tours, our guides may take photographs or videos to document the experience. By participating in our tours, you acknowledge that:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Your image may be captured in group photographs or videos</li>
                  <li>These materials may be used for our promotional purposes, including on our website, social media, and marketing materials</li>
                  <li>You have the right to request not to be photographed or to have your images removed from our materials</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  If you do not wish to be photographed during the tour, please inform your guide at the beginning of the tour.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Social Media Integration</h3>
                <p className="text-gray-700 mb-3">
                  Our website integrates with social media platforms to enhance your experience:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Social sharing buttons allow you to share content on your social media accounts</li>
                  <li>Social media feeds may display our latest posts or user-generated content related to Taxila</li>
                  <li>If you interact with these features, the relevant social media platform may collect information about you according to their privacy policies</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  We encourage you to review the privacy policies of any social media platforms you use to understand how they handle your information.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">User-Generated Content</h3>
                <p className="text-gray-700">
                  If you share your photos, videos, or testimonials with us on social media using our hashtags or by tagging us, you grant us permission to use this content on our website and social media channels. If you would like your content removed, please contact us, and we will promptly address your request.
                </p>
              </div>
            </div>
          </section>
          
          {/* Children's Privacy */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">Children's Privacy</h2>
            
            <p className="text-gray-700 mb-4">
              Our website and services are not directed to children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have inadvertently collected personal information from a child under 16, we will take steps to delete such information as soon as possible.
            </p>
            
            <p className="text-gray-700">
              If you are a parent or guardian and believe that your child has provided us with personal information, please contact us so that we can take appropriate action.
            </p>
          </section>
          
          {/* International Data Transfers */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">International Data Transfers</h2>
            
            <p className="text-gray-700 mb-4">
              We are based in Pakistan, and your information may be processed in countries where we operate or where our service providers are located. These countries may have different data protection laws than your country of residence.
            </p>
            
            <p className="text-gray-700 mb-4">
              When we transfer your information across borders, we implement appropriate safeguards in accordance with applicable law to ensure your information remains protected. These safeguards may include:
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Data transfer agreements incorporating standard contractual clauses</li>
              <li>Verification of third-party privacy certifications</li>
              <li>Implementation of stringent data protection measures</li>
            </ul>
            
            <p className="text-gray-700">
              By using our services, you consent to the transfer of your information to countries that may have different data protection rules than in your country.
            </p>
          </section>
          
          {/* Policy Updates */}
          <section className="mb-10 bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">Policy Updates</h2>
            
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make changes, we will update the "Last Updated" date at the top of this policy and take appropriate measures to inform you, consistent with the significance of the changes we make.
            </p>
            
            <p className="text-gray-700">
              We encourage you to review this policy periodically to stay informed about how we are protecting your information. Your continued use of our website and services after any changes to this Privacy Policy constitutes your acceptance of the revised policy.
            </p>
          </section>
          
          {/* Contact Information */}
          <section className="bg-[#1E293B] rounded-xl shadow-lg p-6 md:p-8 text-white">
            <div className="flex items-center mb-6">
              <PhoneIcon className="w-7 h-7 text-[#E6A44E] mr-3" />
              <h2 className="text-2xl font-bold">Contact Us</h2>
            </div>
            
            <p className="mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer:
            </p>
            
            <div className="space-y-4 mb-6">
              <p className="flex items-center">
                <span className="font-semibold w-24">Email:</span>
                <span>privacy@gandharataxila.com</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold w-24">Phone:</span>
                <span>+92 300 123 4567</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold w-24">Address:</span>
                <span>Gandhara Taxila Heritage Center, Main Tourism Road, Taxila, Pakistan</span>
              </p>
            </div>
            
            <p className="text-gray-300">
              We will respond to your inquiry as soon as possible and within the timeframe required by applicable law.
            </p>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-300">
                By using our website, booking our tours, or purchasing our products, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;