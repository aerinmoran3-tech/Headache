/**
 * status-map.js
 * Centralized source of truth for application status values.
 */
export const STATUS = {
    AWAITING_PAYMENT: 'awaiting_payment',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    DENIED: 'denied',
    MORE_INFO_REQUESTED: 'more_info_requested'
};

export const STATUS_LABELS = {
    [STATUS.AWAITING_PAYMENT]: 'Awaiting Payment',
    [STATUS.UNDER_REVIEW]: 'Under Review',
    [STATUS.APPROVED]: 'Approved',
    [STATUS.DENIED]: 'Denied',
    [STATUS.MORE_INFO_REQUESTED]: 'More Info Requested'
};
