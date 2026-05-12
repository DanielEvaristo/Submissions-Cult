import SubmitFlowV2 from "@/components/submit/SubmitFlowV2";

export default function PublicSubmitPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-20">
        <SubmitFlowV2 basePath="/portal" />
      </div>
    </div>
  );
}
