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
import { DegreesOrCertificateService } from '~/services/degrees.service'
import { AssistanceService } from '~/services/assistance.service'
import { CalendarService } from '~/services/calendar.service'

export default defineNuxtPlugin(() => {
	const fetchModule = new Fetch()
	const filesService = new FilesService(fetchModule)
	return {
		provide: {
			fetchModule,
			semesterService: new SemestersService(fetchModule),
			moduleService: new ModulesService(fetchModule),
			gradesService: new GradesService(fetchModule, filesService),
			libraryService: new LibraryService(fetchModule),
			directivesService: new DirectivesService(fetchModule),
			collegeService: new CollegeService(fetchModule),
			courseService: new CourseService(fetchModule),
			studentsService: new StudentsService(fetchModule),
			historyService: new HistoryService(fetchModule),
			subjectService: new SubjectService(fetchModule),
			teacherService: new TeacherService(fetchModule),
			newsService: new NewsService(fetchModule),
			homeService: new HomeService(fetchModule),
			booklifeService: new BooklifeService(fetchModule),
			userService: new UserService(fetchModule),
			publicationsService: new PublicationsService(fetchModule),
			workService: new WorkService(fetchModule, filesService),
			formService: new FormService(fetchModule),
			notificationService: new NotificationsService(fetchModule),
			filesService,
			reportService: new ErrorService(fetchModule),
			parentService: new ParentService(fetchModule),
			degreesService: new DegreesOrCertificateService(fetchModule),
			assistanceService: new AssistanceService(fetchModule),
			calendarService: new CalendarService(fetchModule),
		},
	}
})
