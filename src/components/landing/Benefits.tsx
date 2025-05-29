import Image from "next/image";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Instant receipts & transparent tracking",
  "Multiple payment methods supported",
  "Reduced administrative workload",
  "Parent-friendly dashboard",
  "Secure & compliant transactions",
  "Automated fee reminders",
];

const Benefits = () => {
  return (
    <section className="w-full py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Benefits List */}
        <div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-6">
            Why Choose Our Payment System?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            Our solution is designed to make fee payments stress-free for both parents and schools. Here’s why thousands trust us:
          </p>

          <ul className="space-y-4">
            {benefits.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="text-green-600 w-5 h-5 mt-1" />
                <span className="text-gray-700 text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Image */}
        <div className="relative w-full h-80 md:h-[450px]">
          <Image
            src="/assets/benefits.jpg" // replace with your own image
            alt="Payment system illustration"
            layout="fill"
            objectFit="cover"
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Benefits;
