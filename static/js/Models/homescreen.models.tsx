import {Class} from './common.models';

export interface Notification {
    title: string;
    body: string;
    CLASS?: number;
    MESSAGE: number;
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
    dueDates: DueDatesResponse[];
    messages: MessagesResponse[];
}

export interface DueDatesResponse {
    class: Class;
    dueDates: DueDate[];
}

export interface MessagesResponse {
    class: Class;
    messages: Notification[];
}
