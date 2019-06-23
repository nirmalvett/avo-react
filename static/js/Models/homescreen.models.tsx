import { ColorMap } from './theme.models'
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
export interface Class {
    name: string
    id: number
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
