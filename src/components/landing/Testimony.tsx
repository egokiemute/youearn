import React from "react";

interface ITestimonyCard {
    name: string;
    title: string;
    message: string;
}

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 fill-green-600 text-green-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

const TestimonyCard: React.FC<ITestimonyCard> = ({ name, title, message }) => (
  <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md border max-w-2xl transition-all hover:shadow-lg">
    <div className="flex gap-1 mb-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <StarIcon key={i} />
        ))}
    </div>
    <p className="mb-6 leading-relaxed text-base text-gray-700">
      {message}
    </p>
    <div>
      <h4 className="font-semibold text-gray-900">{name}</h4>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
);

const Testimony = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-green-600 text-white px-4 py-1 text-sm font-medium uppercase tracking-wide shadow-sm mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Trusted by Teams That Deliver
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how teams of all sizes use our platform to ship projects faster and collaborate better.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          <TestimonyCard
            name="Sarah Chen"
            title="Engineering Manager, FinTech Solutions"
            message="We reduced sprint planning time by 40% while improving visibility across teams. The intuitive interface made adoption effortless — even our non-technical stakeholders love it."
          />
          <TestimonyCard
            name="James Okocha"
            title="Product Lead, DevBridge Africa"
            message="Using this platform accelerated our workflow and improved communication. It's become an indispensable tool in our stack."
          />
        </div>
      </div>
    </section>
  );
};

export default Testimony;
