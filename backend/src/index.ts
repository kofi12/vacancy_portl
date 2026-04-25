import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authController } from './presentation/controllers/auth_controller.ts'
import { userController } from './presentation/controllers/user_controller.ts'
import { orgController } from './presentation/controllers/org_controller.ts'
import { rcfController } from './presentation/controllers/rcf_controller.ts'
import { applicantController } from './presentation/controllers/applicant_controller.ts'
import { applicationController } from './presentation/controllers/application_controller.ts'
import { applicationDocumentController } from './presentation/controllers/application_document_controller.ts'
import { rcfFormController } from './presentation/controllers/rcf_form_controller.ts'
import { corsMiddleware } from './presentation/middleware/cors_middleware.ts'
import { errorHandler } from './presentation/middleware/error_handler.ts'

const app = new Hono()

app.use('*', corsMiddleware)
app.onError(errorHandler)

app.route('/auth', authController)
app.route('/users', userController)
app.route('/orgs', orgController)
app.route('/rcfs', rcfController)
app.route('/applicants', applicantController)
app.route('/applications', applicationController)
app.route('/application-documents', applicationDocumentController)
app.route('/rcf-forms', rcfFormController)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
