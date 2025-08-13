import React from 'react';
import './PrivacyPolicyPage.css';

const PrivacyPolicy = () => {
    return (
        <div className="terms-container">
            {/* Section 1: Banner */}
            <section className="terms-banner">
                <h1>Privacy Policy</h1>
            </section>

            {/* Section 2: Content */}
            <section className="terms-content">
                <p className="updated-date">Last Updated on 29 May, 2023</p>

                <p className="highlight">
        PLEASE READ THIS PRIVACY POLICY CAREFULLY. BY USING THE WEBSITE, YOU
        INDICATE THAT YOU UNDERSTAND, AGREE AND CONSENT TO THIS PRIVACY POLICY.
        IF YOU DO NOT AGREE WITH THE TERMS OF THIS PRIVACY POLICY, PLEASE DO NOT
        USE THIS WEBSITE.
      </p>

      <p>
        This Privacy Policy (“Policy“) is published in accordance with Rule
        3(1) of the Information Technology (Intermediaries Guidelines) Rules,
        2011. This Policy is an ‘electronic record’ as contemplated under
        section 2(t) of the Information Technology Act, 2000 and does not
        require any physical or digital signature.
      </p>

      <h2 className='padd'>Introduction</h2>
      <p>
        Users are requested to read and understand the Policy very carefully
        before using or accessing the Website. Through this Policy, Our Company
        intends to convey the manner in which the user’s information is
        collected and used while providing the services of the Website. This
        Policy is binding on every user of the Website and users who do not
        agree with the terms of this Policy should not use or access the
        Website.
      </p>
      <p>
        Our Company reserves its right to change, edit, alter, amend, modify,
        review, revise or substitute this Policy with or without notice. By
        using the Website, the users signify they have carefully read,
        understood and agree to be bound by this Policy including any changes
        made from time to time.
      </p>

      <h2 className='padd'>User Information</h2>
      <p>
        ‘User information’ includes the user’s personal information that can be
        used to uniquely identify or contact a single person including name,
        email address, residential address, phone number, photograph and other
        information collected by Our Company to provide services to the user.
      </p>
      <p>
        If any user is providing any User Information on behalf of any entity,
        they should be authorized by such entity to provide such information to
        Our Company.
      </p>

      <h2 className='padd'>Use of Information &amp; Disclosure</h2>
      <p>
        The User Information is primarily used to facilitate a better,
        customized, and convenient use of the Website’s services. It may also
        be used to respond to queries, improve services, detect fraud, send
        marketing communications, personalize the experience, and process
        transactions.
      </p>
      <p>
        User Information is disclosed if required by law, in good faith for
        legal processes, or in case of mergers/acquisitions. It may also be
        shared with trusted third-party vendors and service providers.
      </p>

      <h2 className='padd'>User Representation</h2>
      <ul>
        <li>
          The Information you provide is authentic, correct, current, and
          updated.
        </li>
        <li>
          Providing the Information does not violate any third-party agreement
          or law.
        </li>
        <li>
          Our Company is not responsible for the authenticity of the
          Information.
        </li>
        <li>
          Information may be stored in electronic or physical form in or
          outside India.
        </li>
      </ul>

      <h2 className='padd'>Security &amp; User Restriction</h2>
      <p>
        Our Company implements standard measures to protect against
        unauthorized access but no internet site can guarantee 100% security.
        Users are responsible for maintaining the confidentiality of their
        account and password.
      </p>

      <h2 className='padd'>Third Party Websites and Links</h2>
      <p>
        The Website may provide links to third-party websites. Our Company is
        not responsible for their privacy practices or content. Users should
        read their privacy policies before interacting with them.
      </p>

      <h2 className='padd' >General Terms</h2>
      <p>
        This Policy is part of the Website’s Terms of Use and Terms and
        Conditions of Sale. User Information may be stored and processed
        internationally in compliance with applicable laws.
      </p>
</section>
        </div>
    );
};

export default  PrivacyPolicy;
