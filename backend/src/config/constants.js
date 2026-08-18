export const ROLES = {
  ADMIN:    'admin',
  UPLOADER: 'uploader',
  VIEWER:   'viewer',
}

export const UPLOAD_STATUS = {
  PENDING:    'pending',
  PROCESSING: 'processing',
  COMPLETE:   'complete',
  ERROR:      'error',
}

export const AUDIT_ACTIONS = {
  LOGIN:              'login',
  LOGOUT:             'logout',
  UPLOAD_STARTED:     'upload_started',
  UPLOAD_COMPLETED:   'upload_completed',
  DOWNLOAD:           'download',
  USER_CREATED:       'user_created',
  USER_UPDATED:       'user_updated',
  USER_DELETED:       'user_deleted',
}

export const COMPLETION_STATUS = {
  COMPLETED:   'Completed',
  INCOMPLETED: 'Incompleted',
  NOT_STARTED: 'Not Started',
}

export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 100,
  MAX_LIMIT:     500,
}
