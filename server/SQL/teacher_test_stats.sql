SELECT max_grades.CLASS,
       max_grades.TEST,
       ROUND(AVG(max_grades.grade) / max_grades.total * 100, 2)    AS average,
       ROUND(STDDEV(max_grades.grade) / max_grades.total * 100, 2) AS stdev,
       COUNT(max_grades.grade)                          AS student_count
FROM   (SELECT CLASS.CLASS,
               TEST.TEST,
               TEST.total,
               MAX(takes.grade) AS grade
        FROM   CLASS
               INNER JOIN TEST
                       ON TEST.CLASS = CLASS.CLASS
               INNER JOIN takes
                       ON takes.TEST = TEST.TEST
                          AND NOT takes.USER = CLASS.USER
        WHERE  CLASS.USER = :user
        GROUP  BY takes.USER,
                  takes.TEST) as max_grades
GROUP  BY max_grades.TEST;