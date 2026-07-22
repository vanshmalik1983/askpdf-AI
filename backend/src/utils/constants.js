export const DOCUMENT_STATUS = {
  UPLOADED: "uploaded",
  QUEUED: "queued",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

export const JOB_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const QUEUE_NAMES = {
  PDF_PROCESSING: "pdf-processing",
  SUMMARY: "summary-generation",
};

export const NO_ANSWER_MESSAGE =
  "The uploaded document does not contain enough information to answer this question.";
