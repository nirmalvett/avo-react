export interface Notification {
    header: string;
    body: string;
    CLASS?: number;
    announcementID: number;
    timestamp: number;
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
