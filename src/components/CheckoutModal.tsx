import React, { useState } from 'react';
import { X, ShieldCheck, Smartphone, Building2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { Course, Order } from '../types/lms';
import { useLMS } from '../context/LMSContext';

interface CheckoutModalProps {
  course: Course | null;
  onClose: () => void;
  onOrderSubmitted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  course,
  onClose,
  onOrderSubmitted,
}) => {
  const { settings, submitCourseOrder } = useLMS();
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank_transfer'>('mpesa');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentPhoneOrAccount, setPaymentPhoneOrAccount] = useState('');
  const [paymentDateStr, setPaymentDateStr] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [paymentNotes, setPaymentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedValue, setCopiedValue] = useState('');

  if (!course) return null;

  const finalAmount =
    course.salePrice > 0 && course.salePrice < course.regularPrice
      ? course.salePrice
      : course.regularPrice;
  const discount = Math.max(0, course.regularPrice - finalAmount);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(''), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (paymentReference.trim().length < 4) {
      setErrorMsg('Please enter a valid M-Pesa or Bank transaction reference code.');
      return;
    }
    if (!paymentPhoneOrAccount.trim()) {
      setErrorMsg(
        paymentMethod === 'mpesa'
          ? 'Please enter the M-Pesa phone number used for payment.'
          : 'Please enter the sender account name or number.'
      );
      return;
    }

    setLoading(true);
    try {
      const order = await submitCourseOrder(
        course,
        paymentMethod,
        paymentReference.trim(),
        paymentPhoneOrAccount.trim(),
        paymentDateStr,
        paymentNotes.trim()
      );
      onOrderSubmitted(order);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to submit payment reference. Please ensure your email is verified.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 my-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Course Enrollment & Tuition Verification</span>
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-6">
          Enroll in {course.title}
        </h2>

        {/* Order Summary Bar */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#475569]">Selected Program</div>
            <div className="text-sm font-semibold text-[#0F172A]">{course.title}</div>
            <div className="text-xs text-[#475569] mt-0.5">
              Access Period:{' '}
              {course.accessType === 'lifetime'
                ? 'Lifetime Access'
                : `${course.accessDurationDays} Days from Verification`}
            </div>
          </div>
          <div className="text-right">
            {discount > 0 && (
              <div className="text-xs text-[#475569] line-through tabular-nums">
                {course.currency} {course.regularPrice.toLocaleString()}
              </div>
            )}
            <div className="text-lg font-bold text-[#0F172A] tabular-nums">
              {course.currency} {finalAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#475569]">Server-verified price</div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[#0F172A] mb-2">
            Step 1: Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa')}
              className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                paymentMethod === 'mpesa'
                  ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#0F172A]'
                  : 'border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]'
              }`}
            >
              <Smartphone className="w-5 h-5 text-[#16A34A] shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">M-Pesa</div>
                <div className="text-xs text-[#475569] tabular-nums">
                  Number: {settings.mpesaPaybillOrNumber}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                paymentMethod === 'bank_transfer'
                  ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#0F172A]'
                  : 'border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]'
              }`}
            >
              <Building2 className="w-5 h-5 text-[#2563EB] shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">Bank Transfer</div>
                <div className="text-xs text-[#475569] tabular-nums">
                  Acc: {settings.bankAccountNumber}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Instructions Box */}
        <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] mb-6">
          <div className="text-xs font-semibold text-[#0F172A] mb-2">
            Step 2: Complete Transfer Using Official Details
          </div>

          {paymentMethod === 'mpesa' ? (
            <div className="space-y-2.5 text-xs text-[#475569]">
              <div className="flex items-center justify-between bg-white p-3 rounded border border-[#E2E8F0]">
                <div>
                  <span className="text-[#475569] block">M-Pesa Payment Number:</span>
                  <span className="text-base font-bold text-[#0F172A] font-mono tabular-nums">
                    {settings.mpesaPaybillOrNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.mpesaPaybillOrNumber)}
                  className="px-3 py-1.5 text-xs font-medium bg-[#F8FAFC] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0] rounded inline-flex items-center gap-1.5 text-[#0F172A]"
                >
                  {copiedValue === settings.mpesaPaybillOrNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
              <p className="leading-relaxed">{settings.mpesaInstructions}</p>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs text-[#475569]">
              <div className="flex items-center justify-between bg-white p-3 rounded border border-[#E2E8F0]">
                <div>
                  <span className="text-[#475569] block">Bank Account Number:</span>
                  <span className="text-base font-bold text-[#0F172A] font-mono tabular-nums">
                    {settings.bankAccountNumber}
                  </span>
                  {settings.bankName && (
                    <span className="block text-xs text-[#0F172A] mt-0.5">
                      Bank: {settings.bankName}
                      {settings.bankBranch ? ` (${settings.bankBranch})` : ''}
                    </span>
                  )}
                  {settings.bankAccountName && (
                    <span className="block text-xs text-[#0F172A]">
                      Account Name: {settings.bankAccountName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.bankAccountNumber)}
                  className="px-3 py-1.5 text-xs font-medium bg-[#F8FAFC] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0] rounded inline-flex items-center gap-1.5 text-[#0F172A]"
                >
                  {copiedValue === settings.bankAccountNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Account</span>
                    </>
                  )}
                </button>
              </div>
              {!settings.bankName && (
                <p className="text-[#D97706]">
                  Note: Additional bank name/branch details can be requested via WhatsApp ({settings.contactWhatsapp}) or configured by the administrator in Payment Settings.
                </p>
              )}
              <p className="leading-relaxed">{settings.bankInstructions}</p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-lg bg-[#DC2626]/5 border border-[#DC2626]/20 flex items-start gap-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Payment Reference Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs font-semibold text-[#0F172A]">
            Step 3: Submit Payment Reference for Verification
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">
                {paymentMethod === 'mpesa'
                  ? 'M-Pesa Transaction Code *'
                  : 'Bank Reference / Slip Number *'}
              </label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value.toUpperCase())}
                placeholder={paymentMethod === 'mpesa' ? 'e.g. QKA84920LP' : 'e.g. FT262749102'}
                className="w-full px-3.5 py-2 text-sm font-mono border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">
                {paymentMethod === 'mpesa'
                  ? 'Sender M-Pesa Phone Number *'
                  : 'Sender Account Name / Number *'}
              </label>
              <input
                type="text"
                required
                value={paymentPhoneOrAccount}
                onChange={(e) => setPaymentPhoneOrAccount(e.target.value)}
                placeholder={paymentMethod === 'mpesa' ? 'e.g. 0712345678' : 'e.g. John Kamau'}
                className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">
                Payment Date & Time
              </label>
              <input
                type="datetime-local"
                value={paymentDateStr}
                onChange={(e) => setPaymentDateStr(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">
                Amount Paid ({course.currency})
              </label>
              <input
                type="text"
                disabled
                value={`${course.currency} ${finalAmount.toLocaleString()}`}
                className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] rounded-lg font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">
              Additional Payment Message / Confirmation SMS Paste (Optional)
            </label>
            <textarea
              rows={2}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Paste the full confirmation SMS or add a note for the admissions desk..."
              className="w-full px-3.5 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#475569] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Submitting Reference...' : 'Submit Payment Reference'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
