import { ColorMap } from './theme.models'
import { Class } from './common.models'
export interface HomescreenState {
  selectedDate: Date;
  notifications: MessagesResponse[];
  dueDates: DueDatesResponse[];
  value: number;
  calendarTheme: CalendarTheme;
}
export interface HomescreenProps {
  color: ColorMap;
  jumpToClass(classID: number): void
  jumpToSet(classID: number, dueDateID: number): void
  showSnackBar(header: string, message: string, time: number): void;
}
export interface Notfication {
    title: string;
    body: string;
    CLASS?: number;
    MESSAGE?: number;
    date_created: string;
    selected?: boolean;
    showEdit?: boolean;
}
export interface DueDate {
    name: string;
    dueDate: string;
    id: number;
}
export interface CalendarTheme {
  accentColor: string;
  floatingNav: CalendarThemeFloatingNav;
  headerColor: string;
  selectionColor: string;
  textColor: CalendarThemeTextColor;
  todayColor: string;
  weekdayColor: string;
}
export interface CalendarThemeFloatingNav {
  background: string;
  chevron: string;
  color: string;
}
export interface CalendarThemeTextColor {
  active: string;
  default: string;
}
export interface GetHomeResponse {
    dueDates: DueDatesResponse[]
    messages: MessagesResponse[]
}
export interface DueDatesResponse {
    class: Class
    dueDates: DueDate[]
}
export interface MessagesResponse {
    class: Class
    messages: Notfication[]
}
export interface NotifyClassState {
  classes: Class[];
  selectedClassName: string;
  addMessageInput: string;
  messageBodyInput: string;
  messages: Notfication[];
  classNames: string[];
  editTitle: string;
  editBody: string;
  selectedMessage: Notfication;
  showEdit: boolean;
}