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
               INNER JOIN TRANSACTION
                       ON TRANSACTION .CLASS = CLASS.CLASS
               INNER JOIN USER calling_user
                       ON TRANSACTION .USER = calling_user.USER
               INNER JOIN TEST
                       ON TEST.CLASS = TRANSACTION .CLASS
               INNER JOIN takes
                       ON takes.TEST = TEST.TEST
               INNER JOIN USER takes_user
                       ON takes.USER = takes_user.USER
                          AND NOT CLASS.USER = takes_user.USER
        WHERE  calling_user.USER = :user
        GROUP  BY takes.USER,
                  takes.TEST,
                  TRANSACTION .CLASS) AS max_grades
GROUP  BY max_grades.TEST;
