"use client";

import { useSession } from "next-auth/react";
import { useMasterDashboard } from "@/components/curator/master/useMasterDashboard";
import { MasterSidebar } from "@/components/curator/master/MasterSidebar";
import { MasterReviewPanel } from "@/components/curator/master/MasterReviewPanel";
import { PublishModal } from "@/components/curator/master/PublishModal";

export default function MasterCuratorDashboard() {
  const { data: session } = useSession();
  const {
    activeTab,
    setActiveTab,
    submissions,
    loading,
    selectedId,
    setSelectedId,
    newCount,
    setNewCount,
    queue,
    queueLoading,
    publishModalId,
    setPublishModalId,
    setPublishModalType,
    publicationUrl,
    setPublicationUrl,
    publishLoading,
    publishError,
    setPublishError,
    rating,
    setRating,
    notes,
    setNotes,
    selectedPlacements,
    setSelectedPlacements,
    selectedPremium,
    setSelectedPremium,
    actionLoading,
    error,
    handlePublish,
    handleAction,
  } = useMasterDashboard();

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col lg:flex-row overflow-hidden relative">
      <MasterSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        submissions={submissions}
        loading={loading}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        newCount={newCount}
        setNewCount={setNewCount}
        queue={queue}
        queueLoading={queueLoading}
        setPublishModalId={setPublishModalId}
        setPublishModalType={setPublishModalType}
        setPublicationUrl={setPublicationUrl}
        setPublishError={setPublishError}
      />

      <MasterReviewPanel
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        submissions={submissions}
        rating={rating}
        setRating={setRating}
        notes={notes}
        setNotes={setNotes}
        selectedPlacements={selectedPlacements}
        setSelectedPlacements={setSelectedPlacements}
        selectedPremium={selectedPremium}
        setSelectedPremium={setSelectedPremium}
        actionLoading={actionLoading}
        error={error}
        handleAction={handleAction}
      />

      <PublishModal
        publishModalId={publishModalId}
        setPublishModalId={setPublishModalId}
        publicationUrl={publicationUrl}
        setPublicationUrl={setPublicationUrl}
        publishError={publishError}
        publishLoading={publishLoading}
        handlePublish={handlePublish}
      />
    </div>
  );
}
