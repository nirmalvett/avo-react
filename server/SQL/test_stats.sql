SELECT max_grades.SECTION,
       max_grades.TEST,
       ROUND(AVG(max_grades.grade) / max_grades.total * 100, 2)    AS average,
       ROUND(STDDEV(max_grades.grade) / max_grades.total * 100, 2) AS stdev,
       COUNT(max_grades.grade)                                     AS student_count
FROM   (SELECT `SECTION`.SECTION,
               TEST.TEST,
               TEST.total,
               MAX(takes.grade) AS grade
        FROM   `SECTION`
               INNER JOIN user_section
                       ON user_section.SECTION = `SECTION`.SECTION
               INNER JOIN USER calling_user
                       ON user_section.USER = calling_user.USER
               INNER JOIN TEST
                       ON TEST.SECTION = user_section.SECTION
               INNER JOIN takes
                       ON takes.TEST = TEST.TEST
               INNER JOIN USER takes_user
                       ON takes.USER = takes_user.USER
        WHERE  calling_user.USER = :user
        GROUP  BY takes.USER,
                  takes.TEST,
                  user_section.SECTION) AS max_grades
GROUP  BY max_grades.TEST;
