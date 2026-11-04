import { Check, Copy, X } from 'lucide-react';
import React from 'react';

interface PaymentModalProps {
  setShowPaymentModal: (show: boolean) => void;
  generatePaymentCode: () => string;
  copyToClipboard: () => void;
  copied: boolean;
  createOrder: () => void;
  isSubmitting: boolean;
}

function PaymentModal({
  setShowPaymentModal,
  generatePaymentCode,
  copyToClipboard,
  copied,
  createOrder,
  isSubmitting,
}: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg text-gray-900">Payment Instructions</h2>
          <button
            onClick={() => setShowPaymentModal(false)}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-sm p-1.5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-[#7A4F00]">
            <strong>Demo payment:</strong> no real money is taken. In a live store you would dial
            this code to pay; here you can simply press <strong>Place order</strong>.
          </p>
          <p className="text-gray-700 mb-4">Pay with your phone by dialling this code:</p>

          <div
            onClick={copyToClipboard}
            className="bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono text-gray-800">{generatePaymentCode()}</code>
              {copied ? (
                <Check className="text-green-600" size={20} />
              ) : (
                <Copy className="text-gray-500" size={20} />
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Click the code above to copy it to your clipboard
          </p>
        </div>

        <div className="flex items-center justify-end p-4 border-t border-gray-200 gap-3">
          <button
            onClick={() => setShowPaymentModal(false)}
            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded border border-gray-200 text-sm px-5 py-2.5"
          >
            Close
          </button>
          <button
            onClick={createOrder}
            disabled={isSubmitting}
            className="text-[#0B1F3A] font-bold bg-[#FFB020] hover:bg-amber-400 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded text-sm px-5 py-2.5 disabled:opacity-50"
          >
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
