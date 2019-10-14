import * as Http from '../Http';
import {convertListFloatToAnalytics} from '../HelperFunctions/Helpers';

interface ThemeObj {
    theme: 'light' | 'dark';
    color: {
        '100': string;
        '200': string;
        '500': string;
    };
}

export function generateChartOptions(selectedClass: Http.GetSections_Section, theme: ThemeObj) {
    let xCategories = [];
    for (let i = 0; i < selectedClass.tests.length; i++) {
        xCategories.push(selectedClass.tests[i].name);
    }
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
                    for (let i = 0; i < selectedClass.tests.length; i++) {
                        if (selectedClass.tests[i].name === val) {
                            return `${val} (size: ${selectedClass.tests[i].sectionSize})`;
                        }
                    }
                },
            },
            categories: xCategories,
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
) {
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
                ? (() => {
                      const dataObj = convertListFloatToAnalytics(
                          testStats.topMarkPerStudent,
                          testStats.totalMark as number,
                      );
                      delete dataObj['studentSizeWhoTookIt'];
                      const dataOutArray = [];
                      for (let key in dataObj)
                          if (dataObj.hasOwnProperty(key)) dataOutArray.push(key);
                      return dataOutArray;
                  })()
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
            max:
                testStatsDataSelectIdx === 3
                    ? convertListFloatToAnalytics(
                          testStats.topMarkPerStudent,
                          testStats.totalMark as number,
                      ).studentSizeWhoTookIt
                    : 100,
            tickAmount: Math.min(
                convertListFloatToAnalytics(
                    testStats.topMarkPerStudent,
                    testStats.totalMark as number,
                ).studentSizeWhoTookIt as number,
                10,
            ),
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
) {
    if (!testStats) {
        throw new Error();
    }
    let dataObj = convertListFloatToAnalytics(
        testStats.questions[testStatsDataQuestionIdx].topMarksPerStudent as number[],
        testStats.questions[testStatsDataQuestionIdx].totalMark as number,
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
        labels: (() => {
            const dataOutArray = [];
            for (let key in dataObj)
                if (dataObj.hasOwnProperty(key) && key !== 'studentSizeWhoTookIt')
                    dataOutArray.push(key);
            return dataOutArray;
        })(),
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
            max: dataObj.studentSizeWhoTookIt,
            tickAmount: dataObj.studentSizeWhoTookIt >= 10 ? 10 : dataObj.studentSizeWhoTookIt,
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
