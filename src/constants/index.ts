// Application constants

export const APP_NAME = 'Dolce CRM'
export const APP_DESCRIPTION = 'CRM and task management for leads, sprints, and team collaboration'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    UPDATE: '/api/projects',
    DELETE: '/api/projects',
  },
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    UPDATE: '/api/tasks',
    DELETE: '/api/tasks',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: '/api/users',
    DELETE: '/api/users',
  },
  CHAT: {
    ROOMS: '/api/chat/rooms',
    MESSAGES: '/api/chat/messages',
  },
  CALENDAR: {
    EVENTS: '/api/calendar/events',
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    DOWNLOAD: '/api/files/download',
  },
  TICKETS: {
    LIST: '/api/tickets',
    CREATE: '/api/tickets',
    UPDATE: '/api/tickets',
  },
  NOTES: {
    LIST: '/api/notes',
    CREATE: '/api/notes',
    UPDATE: '/api/notes',
  },
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const

// Task statuses
export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const

// Task priorities
export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

// Project statuses
export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  COMPLETED: 'COMPLETED',
} as const

// Chat room types
export const CHAT_ROOM_TYPES = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
  PROJECT: 'PROJECT',
} as const

// File types
export const FILE_TYPES = {
  IMAGE: 'IMAGE',
  DOCUMENT: 'DOCUMENT',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  OTHER: 'OTHER',
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
} as const

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100,
} as const
