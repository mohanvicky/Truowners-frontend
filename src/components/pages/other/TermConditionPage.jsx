import React from 'react';
import './TermConditionPage.css';

const TermsAndConditions = () => {
    return (
        <div className="terms-container">
            {/* Section 1: Banner */}
            <section className="terms-banner">
                <h1>Terms & Conditions</h1>
            </section>

            {/* Section 2: Content */}
            {/* <section className="terms-content">
                <p className="updated-date">Last Updated on 29 May, 2023</p>

                <h2>1. DEFINITIONS</h2>
                <p>
                    Unless otherwise specified, the capitalized terms shall have the meanings set out below:
                </p>

                <ul>
                    <li>
                        <strong>Account</strong> means and includes the account created on the Site, by the User, in accordance with the terms of the Agreement, registered with and approved by NoBroker.
                    </li>
                    <li>
                        <strong>Agreement</strong> means and includes the Terms and Conditions, Privacy Policy and any other such terms and conditions that may be mutually agreed upon between NoBroker and the User in relation to the Services.
                    </li>
                    <li>
                        <strong>Applicable Law</strong> means and includes any statute, law, regulation, sub-ordinate legislation, ordinance, rule, judgment, rule of law, order (interim or final), writ, decree, clearance, Authorizations...
                    </li>
                    <li>
                        <strong>Broker</strong> means and includes all brokers, channel partners, sales agencies and other third parties who/which negotiate or act on behalf of one person in a transaction of transfer...
                    </li>
                    <li>
                        <strong>Computer Virus</strong> means and includes any computer instruction, information, data or programme that destroys, damages, degrades or adversely affects the performance of a computer resource...
                    </li>
                    <li>
                        <strong>Confidential Information</strong> means and includes all information that is not in the public domain, in spoken, printed, electronic or any other form or medium, relating directly or indirectly to...
                    </li>
                    <li>
                        <strong>Content</strong> means and includes any information all data and information on the Site.
                    </li>
                    <li>
                        <strong>Government Authority</strong> means and includes any government, any state or other political subdivision thereof...
                    </li>
                </ul>
            </section> */}

               <section className="terms-content">

                  <p className="updated-date">Last Updated on 29 May, 2023</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to Tru Owners. By accessing our website or using our services, you agree to abide by these terms and conditions. These terms apply to all users, including property owners, buyers, tenants, and visitors.
        </p>
      </section>

      <section className="terms-content">
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years of age to register and use Tru Owners. You agree to provide accurate, complete, and updated information while creating an account or listing a property.
        </p>
      </section>

      <section className="terms-content">
        <h2>3. User Responsibilities</h2>
        <ul>
          <li>You agree not to post false, misleading, or unlawful content.</li>
          <li>You are solely responsible for the accuracy and legality of the information you provide.</li>
          <li>You shall not use this platform for fraudulent or illegal activities.</li>
        </ul>
      </section>

      <section className="terms-content">
        <h2>4. Listing Rules</h2>
        <ul>
          <li>Only genuine property owners or their authorized representatives may list properties.</li>
          <li>All listings are subject to verification by the Tru Owners team.</li>
          <li>Listings that violate our content policy or appear suspicious may be removed without notice.</li>
        </ul>
      </section>

      <section className="terms-content">
        <h2>5. Service Charges</h2>
        <p>
          Basic listing is free. Additional paid services such as premium listings, legal assistance, and promotions are optional and non-refundable unless explicitly mentioned.
        </p>
      </section>

      <section className="terms-content">
        <h2>6. Limitation of Liability</h2>
        <p>
          Tru Owners acts as a technology platform and is not a party to any real estate transaction. We are not responsible for disputes between buyers, sellers, or agents. You agree to indemnify Tru Owners for any claims arising from your use of the platform.
        </p>
      </section>

      <section className="terms-content">
        <h2>7. Termination</h2>
        <p>
          Tru Owners reserves the right to suspend or delete accounts or listings that violate our terms or involve suspicious activity without notice.
        </p>
      </section>

      <section className="terms-content">
        <h2>8. Intellectual Property</h2>
        <p>
          All content, branding, and technology used on this site is the intellectual property of Tru Owners and may not be copied or reproduced without permission.
        </p>
      </section>

      <section className="terms-content-last">
      
        <h2>9. Governing Law</h2>
        <p>
          These terms shall be governed by the laws of the Republic of India. Any disputes will be subject to the jurisdiction of courts located in [Your Registered City].
        </p>
      </section>
    </div>

        
    );
};

export default TermsAndConditions;
