export interface Notification {
    title: string;
    body: string;
    CLASS?: number;
    messageID: number;
    dateCreated: number;
    selected?: boolean;
    showEdit?: boolean;
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
