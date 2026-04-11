/** One-line guidance for customers (user app). */
export function userBookingGuidance(status: string, opts?: { hasMechanic?: boolean; paid?: boolean }): string {
  switch (status) {
    case 'REQUESTED':
      return opts?.hasMechanic
        ? 'Waiting for the mechanic’s quote — you’ll unlock chat when you accept it.'
        : 'Waiting for quotes from mechanics — accept one to confirm the job and chat.'
    case 'EXPIRED':
      return 'This open request expired — post a new job if you still need help.'
    case 'ACCEPTED':
      return 'Quote accepted — chat is open. Pay when the work is done (unless you agreed cash-in-hand).'
    case 'IN_PROGRESS':
      return 'Work in progress — stay in touch with your mechanic in chat.'
    case 'DONE':
      return opts?.paid
        ? 'Job marked done and payment recorded.'
        : 'Mechanic marked the job done — complete payment when you’re satisfied.'
    case 'PAID':
    case 'DELIVERED':
      return 'Paid — thank you for using the platform.'
    default:
      return status.replace(/_/g, ' ')
  }
}

/** One-line guidance for mechanics. */
export function mechanicBookingGuidance(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return 'Send your quote — the customer must accept it before chat unlocks.'
    case 'EXPIRED':
      return 'This request expired (open board).'
    case 'ACCEPTED':
      return 'Quote accepted — chat with the customer and start when ready.'
    case 'IN_PROGRESS':
      return 'Work in progress — update status when finished.'
    case 'DONE':
      return 'Marked done — waiting for customer payment if applicable.'
    case 'PAID':
    case 'DELIVERED':
      return 'Paid / closed.'
    default:
      return status.replace(/_/g, ' ')
  }
}

export function quoteStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'ACCEPTED':
      return 'Accepted'
    case 'REJECTED':
      return 'Rejected'
    case 'WITHDRAWN':
      return 'Withdrawn'
    default:
      return status
  }
}
