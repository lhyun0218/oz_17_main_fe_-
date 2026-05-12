import { authHandlers } from './authHandlers'
import { dashboardHandlers } from './dashboardHandlers'
import { lectureHandlers } from './lectureHandlers'
import { assignmentHandlers } from './assignmentHandlers'
import { gradeHandlers } from './gradeHandlers'
import { adminHandlers } from './adminHandlers'
import { enrollmentHandlers } from './enrollmentHandlers'
import { professorHandlers } from './professorHandlers'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...lectureHandlers,
  ...assignmentHandlers,
  ...gradeHandlers,
  ...adminHandlers,
  ...enrollmentHandlers,
  ...professorHandlers,
]
