import * as Http from '../Http';
import {convertListFloatToAnalytics} from '../HelperFunctions/Helpers';
import {GetSections_Test} from '../Http';

interface ThemeObj {
    theme: 'light' | 'dark';
    color: {
        '100': string;
        '200': string;
        '500': string;
    };
}

export function generateChartOptions(
    selectedClass: Http.GetSections_Section,
    theme: ThemeObj,
): ChartOptions {
    return {
        chart: {
            fontFamily: 'Roboto',
            foreColor: theme.theme === 'light' ? '#000000' : '#ffffff',
            id: 'basic-bar',
            type: 'line',
        },
        colors: [theme.color['500'], theme.color['200'], theme.color['100']],
        xaxis: {
            labels: {
                formatter: (val: string) => {
                    const t = selectedClass.tests.find(x => x.name === val) as GetSections_Test;
                    if (t) return `${val} (size: ${t.sectionSize})`;
                },
            },
            categories: selectedClass.tests.map(x => x.name),
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 10,
            categories: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        },
        fill: {
            opacity: 1,
            type: 'solid',
            colors: [theme.color['500'], theme.color['200'], theme.color['100']],
        },
        legend: {
            itemMargin: {
                horizontal: 20,
                vertical: 5,
            },
            containerMargin: {
                left: 5,
                top: 12,
            },
            onItemClick: {
                toggleDataSeries: true,
            },
            onItemHover: {
                highlightDataSeries: true,
            },
        },
        dataLabels: {
            enabled: false,
            formatter: (val: any) => val,
            textAnchor: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                colors:
                    theme.theme === 'light'
                        ? ['#000000', '#000000', '#000000']
                        : ['#ffffff', '#ffffff', '#ffffff'],
            },
            dropShadow: {
                enabled: false,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.45,
            },
        },
        tooltip: {
            theme: theme.theme,
        },
    };
}

export function getTestCardGraphOptions(
    selectedTest: Http.GetSections_Test,
    testStats: Http.TestStats,
    theme: ThemeObj,
    testStatsDataSelectIdx: number,
): ChartOptions {
    return {
        chart: {
            fontFamily: 'Roboto',
            foreColor: theme.theme === 'light' ? '#000000' : '#ffffff',
            id: 'basic-bar',
            type: 'line',
        },
        colors: [theme.color['500'], theme.color['200'], theme.color['100']],
        stroke: {
            curve: 'smooth',
        },
        labels:
            testStatsDataSelectIdx === 2 && selectedTest.submitted.length > 0
                ? selectedTest.submitted.map((obj, idx) => 'Attempt ' + (idx + 1))
                : testStatsDataSelectIdx === 3
                ? Object.keys(convertListFloatToAnalytics(testStats.grades, selectedTest.total))
                : ['', selectedTest.name, ''],
        xaxis: {
            title: {
                text: testStatsDataSelectIdx === 3 ? 'Marks Scored' : '',
            },
        },
        yaxis: {
            title: {
                text: testStatsDataSelectIdx === 3 ? 'Number of Students' : 'Mark(%)',
            },
            min: 0,
            max: testStatsDataSelectIdx === 3 ? testStats.grades.length : 100,
            tickAmount: Math.min(testStats.grades.length, 10),
        },
        fill: {
            opacity: 1,
            type: 'solid',
            colors: [theme.color['500'], theme.color['200'], theme.color['100']],
        },
        legend: {
            itemMargin: {
                horizontal: 20,
                vertical: 5,
            },
            containerMargin: {
                left: 5,
                top: 12,
            },
            onItemClick: {
                toggleDataSeries: true,
            },
            onItemHover: {
                highlightDataSeries: true,
            },
        },
        dataLabels: {
            enabled: false,
            formatter: (val: any) => val,
            textAnchor: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                colors:
                    theme.theme === 'light'
                        ? ['#000000', '#000000', '#000000']
                        : ['#ffffff', '#ffffff', '#ffffff'],
            },
            dropShadow: {
                enabled: false,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.45,
            },
        },
        tooltip: {
            theme: theme.theme,
        },
    };
}

export function getPerQuestionGraphOptions(
    testStats: Http.TestStats,
    testStatsDataQuestionIdx: number,
    testStatsDataSelectIdx: number,
    theme: ThemeObj,
): ChartOptions {
    if (!testStats) {
        throw new Error();
    }
    const topMarksPerStudent = testStats.questions[testStatsDataQuestionIdx].marks;
    let dataObj = convertListFloatToAnalytics(
        topMarksPerStudent,
        testStats.questions[testStatsDataQuestionIdx].total,
    );
    return {
        chart: {
            fontFamily: 'Roboto',
            foreColor: `${theme.theme === 'light' ? '#000000' : '#ffffff'}`,
            id: 'basic-bar',
            type: 'line',
        },
        colors: [`${theme.color['500']}`, `${theme.color['200']}`, `${theme.color['100']}`],
        stroke: {
            curve: 'smooth',
        },
        labels: Object.keys(dataObj),
        xaxis: {
            title: {
                text: testStatsDataSelectIdx === 3 ? 'Marks Scored' : '',
            },
        },
        yaxis: {
            title: {
                text: testStatsDataSelectIdx === 3 ? 'Number of Students' : 'Mark(%)',
            },
            min: 0,
            max: topMarksPerStudent.length,
            tickAmount: topMarksPerStudent.length >= 10 ? 10 : topMarksPerStudent.length,
        },
        fill: {
            opacity: 1,
            type: 'solid',
            colors: [theme.color['500'], theme.color['200'], theme.color['100']],
        },
        legend: {
            itemMargin: {
                horizontal: 20,
                vertical: 5,
            },
            containerMargin: {
                left: 5,
                top: 12,
            },
            onItemClick: {
                toggleDataSeries: true,
            },
            onItemHover: {
                highlightDataSeries: true,
            },
        },
        dataLabels: {
            enabled: false,
            formatter: (val: any) => val,
            textAnchor: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                colors:
                    theme.theme === 'light'
                        ? ['#000000', '#000000', '#000000']
                        : ['#ffffff', '#ffffff', '#ffffff'],
            },
            dropShadow: {
                enabled: false,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.45,
            },
        },
        tooltip: {
            theme: theme.theme,
        },
    };
}

interface Axis {
    labels?: {
        formatter: (val: any) => any;
    };
    title?: {
        text: string;
    };
    min?: number;
    max?: number;
    tickAmount?: number;
    categories?: (string | number)[];
}

export interface ChartOptions {
    chart: {
        fontFamily: 'Roboto';
        foreColor: string;
        id: 'basic-bar';
        type: 'line';
    };
    colors: string[];
    stroke?: {
        curve: 'smooth';
    };
    labels?: string[];
    xaxis: Axis;
    yaxis: Axis;
    fill: {
        opacity: 1;
        type: 'solid';
        colors: string[];
    };
    legend: {
        markers?: {
            size: number;
            strokeColor: string;
            strokeWidth: number;
            offsetX: number;
            offsetY: number;
            radius: number;
            shape: 'circle';
        };
        itemMargin: {
            horizontal: 20;
            vertical: 5;
        };
        containerMargin: {
            left: 5;
            top: 12;
        };
        onItemClick: {
            toggleDataSeries: true;
        };
        onItemHover: {
            highlightDataSeries: true;
        };
    };
    dataLabels: {
        enabled: false;
        formatter: (val: any) => any;
        textAnchor: 'middle';
        offsetX: 0;
        offsetY: 0;
        style: {
            fontSize: '14px';
            fontFamily: 'Helvetica, Arial, sans-serif';
            colors: string[];
        };
        dropShadow: {
            enabled: false;
            top: 1;
            left: 1;
            blur: 1;
            opacity: 0.45;
        };
    };
    tooltip: {
        theme: 'light' | 'dark';
    };
}
