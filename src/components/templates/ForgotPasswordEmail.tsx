import * as React from "react";

interface EmailTemplateProps {
  firstname: string;
  url: string;
}

export const ForgotPasswordEmail: React.FC<Readonly<EmailTemplateProps>> = ({
  firstname,
  url,
}) => (
  <div style={{ fontFamily: "Poppins, Arial, sans-serif", lineHeight: "1.6" }}>
    <h1>Hello, {firstname}!</h1>
    <p>We received a request to reset your password.</p>
    <p>
      Click the link below to set a new password. This link is valid for a
      limited time:
    </p>
    <p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Reset Your Password
      </a>
    </p>
    <p>If you did not request this change, you can safely ignore this email.</p>
    <p>
      Best regards,
      <br />
      The Edupay Team
    </p>
  </div>
);
