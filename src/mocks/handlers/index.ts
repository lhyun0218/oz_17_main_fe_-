import { authHandlers } from './authHandlers'
import { dashboardHandlers } from './dashboardHandlers'
import { lectureHandlers } from './lectureHandlers'
import { assignmentHandlers } from './assignmentHandlers'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...lectureHandlers,
  ...assignmentHandlers,
]
