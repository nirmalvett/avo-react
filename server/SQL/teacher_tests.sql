SELECT CLASS,
       enroll_key,
       class_name,
       TEST,
       test_name,
       is_open,
       deadline,
       timer,
       attempts,
       total,
       round(AVG(grade) / total * 100, 2)    AS average,
       round(STDDEV(grade) / total * 100, 2) AS stdev,
       COUNT(grade) AS student_count
FROM   (SELECT CLASS.CLASS,
               CLASS.enroll_key,
               CLASS.name       AS class_name,
               TEST.TEST,
               TEST.name        AS test_name,
               TEST.is_open,
               TEST.deadline,
               TEST.timer,
               TEST.attempts,
               TEST.total,
               MAX(takes.grade) AS grade
        FROM   CLASS
               INNER JOIN USER u1
                       ON CLASS.USER = u1.USER
               INNER JOIN TEST
                       ON TEST.CLASS = CLASS.CLASS
               INNER JOIN takes
                       ON takes.TEST = TEST.TEST
               INNER JOIN USER u2
                       ON takes.USER = u2.USER
                          AND NOT CLASS.USER = u2.USER
        WHERE  u1.USER = :user
        GROUP  BY takes.USER,
                  takes.TEST,
                  CLASS.CLASS) AS d
GROUP  BY TEST; 