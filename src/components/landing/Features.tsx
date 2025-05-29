import { Banknote, CreditCard, Users, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Features = () => (
  <section className="w-full py-20 lg:py-32 bg-green-50 overflow-hidden">
    <div className="container mx-auto px-6 lg:px-8">
      <div className="flex flex-col gap-12">
        {/* Section Heading */}
        <div className="flex flex-col gap-4 items-start">
          <Badge variant="outline" className="bg-green-100 text-green-700 border-none">
            Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 max-w-2xl">
            Simplifying School Fee Payments
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Our platform makes fee payments hassle-free for schools and parents — track, pay, and manage fees in minutes.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <Banknote className="w-8 h-8 text-green-600 mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Payment Options</h3>
              <p className="text-gray-600 text-base">
                Pay term fees all at once or in installments — we support multiple secure payment methods.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <CreditCard className="w-8 h-8 text-green-600 mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Receipts</h3>
              <p className="text-gray-600 text-base">
                Instantly generate downloadable receipts for every transaction — both for schools and guardians.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <Users className="w-8 h-8 text-green-600 mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Parent Dashboard</h3>
              <p className="text-gray-600 text-base">
                Keep track of multiple students under one account — view fees, due dates, and payment history.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <ReceiptText className="w-8 h-8 text-green-600 mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Reminders</h3>
              <p className="text-gray-600 text-base">
                Get notified before deadlines to avoid late payments — SMS and email notifications available.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <Users className="w-8 h-8 text-green-600 mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
              <p className="text-gray-600 text-base">
                School admins can manage payments, generate reports, and analyze financial data with ease.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <CreditCard className="w-8 h-8 text-green-600 mb-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Transactions</h3>
              <p className="text-gray-600 text-base">
                Built with bank-grade encryption to keep every transaction secure and confidential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
