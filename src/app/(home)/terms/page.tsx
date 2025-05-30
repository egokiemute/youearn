import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#09005b] to-indigo-600 px-8 py-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Terms & Conditions
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Please read these terms carefully before participating in our campaign
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                By participating in this campaign, you acknowledge that you have read, 
                understood, and agree to be bound by the following terms and conditions.
              </p>

              <div className="space-y-8">
                {/* Term 1 */}
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-red-800 mb-2">
                        Bot Usage Prohibition
                      </h3>
                      <p className="text-red-700 leading-relaxed">
                        The use of bots, automated systems, or any artificial means to 
                        participate in this contest is strictly prohibited. Any participant 
                        found using such methods will face <strong>automatic disqualification</strong> 
                        from the contest without prior notice.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Term 2 */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-amber-800 mb-2">
                        Channel Membership Requirement
                      </h3>
                      <p className="text-amber-700 leading-relaxed">
                        Participants must remain active members of the designated channel 
                        throughout the entire duration of the campaign. Leaving the channel 
                        at any point during the campaign period will result in 
                        <strong> ineligibility for any rewards</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Term 3 */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">
                        Manual Review Rights
                      </h3>
                      <p className="text-blue-800 leading-relaxed">
                        Youearn reserves the right to conduct manual reviews of referrals 
                        submitted by top-performing participants. This review process ensures 
                        fair play and compliance with campaign guidelines. All decisions 
                        made during this review are final.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Important Notes
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    These terms may be updated at any time without prior notice
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    Violation of any term may result in immediate disqualification
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    All decisions by Youearn regarding this campaign are final
                  </li>
                </ul>
              </div>

              {/* Footer */}
              <div className="mt-12 text-center">
                <p className="text-gray-500 text-sm">
                  Last updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;