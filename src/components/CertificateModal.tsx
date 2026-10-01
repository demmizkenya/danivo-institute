import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, Search, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Certificate } from '../types/lms';
import { useLMS } from '../context/LMSContext';
import { BrandLogo } from './BrandLogo';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
  onOpenPublicVerify: (certId: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
  onOpenPublicVerify,
}) => {
  const { settings } = useLMS();

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-8 my-8">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Credential · ID: {certificate.certificateId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenPublicVerify(certificate.certificateId)}
              className="px-3.5 py-2 text-xs font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Verification Link</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal Academic Certificate Frame */}
        <div className="border-4 border-double border-[#1D4ED8]/30 bg-[#FFFFFF] p-8 sm:p-14 text-center relative">
          <div className="max-w-2xl mx-auto">
            <BrandLogo
              brandName={settings.brandName}
              logoUrl={settings.logoUrl}
              variant="certificate"
              className="mb-4"
            />
            <p className="text-xs text-[#475569] tracking-wide mb-8">
              {settings.tagline}
            </p>

            <div className="inline-block border-y border-[#E2E8F0] py-2 px-8 mb-6">
              <h1 className="font-serif-academic text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                CERTIFICATE OF COMPLETION
              </h1>
            </div>

            <p className="text-sm text-[#475569] mb-3">This is to certify that</p>

            <h2 className="font-serif-academic text-2xl sm:text-4xl font-bold text-[#2563EB] mb-4">
              {certificate.studentName}
            </h2>

            <p className="text-sm text-[#475569] max-w-lg mx-auto leading-relaxed mb-4">
              has successfully completed all required coursework, practical assessments, and
              competency evaluations for the professional learning program:
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-8">
              {certificate.courseTitle}
            </h3>

            {/* Signatures & Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-[#E2E8F0] text-left">
              <div>
                <div className="font-serif-academic text-sm font-semibold text-[#0F172A] border-b border-[#0F172A]/30 pb-1 mb-1">
                  {certificate.instructorName}
                </div>
                <div className="text-xs text-[#475569]">Program Faculty Lead</div>
                <div className="text-[11px] text-[#475569]">{settings.brandName}</div>
              </div>

              <div className="sm:text-center">
                <div className="text-xs text-[#475569] mb-1">Date of Completion</div>
                <div className="text-sm font-semibold text-[#0F172A] tabular-nums">
                  {certificate.issuedDateStr}
                </div>
                <div className="text-[11px] text-[#16A34A] font-medium mt-1">
                  Status: {certificate.status === 'valid' ? 'Verified & Active' : 'Revoked'}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="font-serif-academic text-sm font-semibold text-[#0F172A] border-b border-[#0F172A]/30 pb-1 mb-1">
                  Academic Registry
                </div>
                <div className="text-xs text-[#475569]">Certificate ID:</div>
                <div className="text-xs font-mono font-semibold text-[#0F172A] tabular-nums">
                  {certificate.certificateId}
                </div>
                <div className="text-[11px] font-mono text-[#475569] tabular-nums">
                  Code: {certificate.verificationCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface VerifyCertificateViewProps {
  initialCertId?: string;
  onBackHome: () => void;
}

export const VerifyCertificateView: React.FC<VerifyCertificateViewProps> = ({
  initialCertId = '',
  onBackHome,
}) => {
  const { settings, verifyCertificateById } = useLMS();
  const [certInput, setCertInput] = useState(initialCertId);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);

  const runVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setSearching(true);
    setSearched(false);
    try {
      const found = await verifyCertificateById(idToVerify.trim());
      setResult(found);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (initialCertId) {
      setCertInput(initialCertId);
      runVerification(initialCertId);
    }
  }, [initialCertId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(certInput);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <button
          type="button"
          onClick={onBackHome}
          className="text-xs font-medium text-[#2563EB] hover:underline mb-3 inline-block"
        >
          ← Back to {settings.brandName}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
          Public Credential Verification Registry
        </h1>
        <p className="text-sm text-[#475569] mt-2">
          Employers, clients, and institutions can verify the authenticity of any{' '}
          {settings.brandName} Certificate of Completion by entering the unique Certificate ID below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mb-8 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-3" />
          <input
            type="text"
            required
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            placeholder="Enter Certificate ID (e.g. CERT-DNV-...)"
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm font-mono border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer"
        >
          {searching ? 'Verifying Registry...' : 'Verify Certificate'}
        </button>
      </form>

      {searched && (
        <div>
          {result && result.status === 'valid' ? (
            <div className="p-6 sm:p-8 bg-white border border-[#16A34A]/30 rounded-xl">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#16A34A] mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>Authentic Certificate of Completion Verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[#E2E8F0] pt-4">
                <div>
                  <span className="text-xs text-[#475569] block">Recipient Full Name</span>
                  <span className="font-semibold text-[#0F172A]">{result.studentName}</span>
                </div>
                <div>
                  <span className="text-xs text-[#475569] block">Completed Program</span>
                  <span className="font-semibold text-[#0F172A]">{result.courseTitle}</span>
                </div>
                <div>
                  <span className="text-xs text-[#475569] block">Certificate ID</span>
                  <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                    {result.certificateId}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#475569] block">Verification Code</span>
                  <span className="font-mono text-[#0F172A] tabular-nums">
                    {result.verificationCode}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#475569] block">Completion Date</span>
                  <span className="text-[#0F172A] tabular-nums">{result.issuedDateStr}</span>
                </div>
                <div>
                  <span className="text-xs text-[#475569] block">Issuing Institution</span>
                  <span className="text-[#0F172A]">{settings.brandName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[#DC2626]/5 border border-[#DC2626]/20 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  No Matching Valid Certificate Found
                </h3>
                <p className="text-xs text-[#475569] mt-1">
                  We could not locate an active Certificate of Completion with ID "{certInput}".
                  Please double-check the exact characters on the credential or contact{' '}
                  {settings.contactEmail}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
