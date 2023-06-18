// Services
import { Fetch } from '~~/common/fetchModule'
import { SemestersService } from '~~/services/semesters.service'
import { ModulesService } from '~~/services/modules.service'
import { FilesService } from '~~/services/files.service'
import { GradesService } from '~~/services/grades.service'
import { LibraryService } from '~~/services/library.service'
import { DirectivesService } from '~~/services/directives.service'
import { CollegeService } from '~~/services/college.service'
import { CourseService } from '~~/services/course.service'
import { StudentsService } from '~~/services/students.service'
import { HistoryService } from '~~/services/history.service'
import { SubjectService } from '~~/services/subject.service'
import { TeacherService } from '~~/services/teacher.service'
import { NewsService } from '~~/services/news.service'
import { HomeService } from '~~/services/home.service'
import { BooklifeService } from '~~/services/booklife.service'
import { UserService } from '~~/services/user.service'
import { PublicationsService } from '~~/services/publications.service'
import { WorkService } from '~~/services/work.service'
import { FormService } from '~~/services/form.service'
import { NotificationsService } from '~~/services/notifications.service'
import { ParentService } from '~~/services/parent.service'
import { ErrorService } from '~/services/error.service'
import { AssistanceService } from '~/services/assistance.service'

export default defineNuxtPlugin(() => {
	const filesService = new FilesService()
	const fetchModule = new Fetch()
	return {
		provide: {
			fetchModule,
			semesterService: new SemestersService(),
			moduleService: new ModulesService(),
			gradesService: new GradesService(filesService),
			libraryService: new LibraryService(),
			directivesService: new DirectivesService(),
			collegeService: new CollegeService(),
			courseService: new CourseService(),
			studentsService: new StudentsService(),
			historyService: new HistoryService(),
			subjectService: new SubjectService(),
			teacherService: new TeacherService(),
			newsService: new NewsService(),
			homeService: new HomeService(),
			booklifeService: new BooklifeService(),
			userService: new UserService(),
			publicationsService: new PublicationsService(),
			workService: new WorkService(filesService),
			formService: new FormService(),
			notificationService: new NotificationsService(),
			filesService,
			reportService: new ErrorService(),
			parentService: new ParentService(),
			assistanceService: new AssistanceService(fetchModule),
		},
	}
})
