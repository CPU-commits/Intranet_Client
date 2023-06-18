import { Fetch } from "~/common/fetchModule"
import { AssistanceService } from "~/services/assistance.service"
import { BooklifeService } from "~/services/booklife.service"
import { CollegeService } from "~/services/college.service"
import { CourseService } from "~/services/course.service"
import { DirectivesService } from "~/services/directives.service"
import { ErrorService } from "~/services/error.service"
import { FilesService } from "~/services/files.service"
import { FormService } from "~/services/form.service"
import { GradesService } from "~/services/grades.service"
import { HistoryService } from "~/services/history.service"
import { HomeService } from "~/services/home.service"
import { LibraryService } from "~/services/library.service"
import { ModulesService } from "~/services/modules.service"
import { NewsService } from "~/services/news.service"
import { NotificationsService } from "~/services/notifications.service"
import { ParentService } from "~/services/parent.service"
import { PublicationsService } from "~/services/publications.service"
import { SemestersService } from "~/services/semesters.service"
import { StudentsService } from "~/services/students.service"
import { SubjectService } from "~/services/subject.service"
import { TeacherService } from "~/services/teacher.service"
import { UserService } from "~/services/user.service"
import { WorkService } from "~/services/work.service"

declare module '#app' {
	interface NuxtApp {
		$fetchModule: Fetch
		$semesterService: SemestersService
		$moduleService: ModulesService
		$gradesService: GradesService
		$libraryService: LibraryService
		$directivesService: DirectivesService
		$collegeService: CollegeService
		$courseService: CourseService
		$studentsService: StudentsService
		$historyService: HistoryService
		$subjectService: SubjectService
		$teacherService: TeacherService
		$newsService: NewsService
		$homeService: HomeService
		$booklifeService: BooklifeService
		$userService: UserService
		$publicationsService: PublicationsService
		$workService: WorkService
		$formService: FormService
		$notificationService: NotificationsService
		$filesService: FilesService
		$reportService: ErrorService
		$parentService: ParentService
		$assistanceService: AssistanceService
	}
}

declare module 'vue' {
	interface CustomProperties {
		$fetchModule: Fetch
		$semesterService: SemestersService
		$moduleService: ModulesService
		$gradesService: GradesService
		$libraryService: LibraryService
		$directivesService: DirectivesService
		$collegeService: CollegeService
		$courseService: CourseService
		$studentsService: StudentsService
		$historyService: HistoryService
		$subjectService: SubjectService
		$teacherService: TeacherService
		$newsService: NewsService
		$homeService: HomeService
		$booklifeService: BooklifeService
		$userService: UserService
		$publicationsService: PublicationsService
		$workService: WorkService
		$formService: FormService
		$notificationService: NotificationsService
		$filesService: FilesService
		$reportService: ErrorService
		$parentService: ParentService
		$assistanceService: AssistanceService
	}
}

export {}
