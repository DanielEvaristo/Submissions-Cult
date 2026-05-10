import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function UnverifiedLock({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in px-4">
      <div className="w-20 h-20 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="font-sans text-2xl font-bold text-cm-text-primary mb-3">
        Account Pending Verification
      </h2>
      <p className="font-sans text-base text-cm-text-secondary max-w-md mx-auto mb-8">
        You will be able to access this feature once your agency account has been verified by our team. Please make sure your profile is fully complete.
      </p>
      <Link href={`/${locale}/industry/profile`} className="btn-primary">
        Go to Agency Profile
      </Link>
    </div>
  );
}
