import { Resend } from "resend";
import { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY! as string);

export const sendEmail = async (
  email: string,
  subject: string,
  reactTemplate: ReactElement
): Promise<unknown> => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Edupay <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      react: reactTemplate,
    });

    if (error) {
      return error;
    }

    return data;
  } catch (error: unknown) {
    return error;
  }
};
