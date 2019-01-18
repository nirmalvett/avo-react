SELECT CLASS,
       TEST,
       round(AVG(grade) / total * 100, 2)    AS average,
       round(STDDEV(grade) / total * 100, 2) AS stdev,
       COUNT(grade) AS student_count
FROM   (SELECT CLASS.CLASS,
               TEST.TEST,
               TEST.total,
               MAX(takes.grade) AS grade
        FROM   CLASS
               INNER JOIN enrolled
                       ON enrolled.CLASS = CLASS.CLASS
               INNER JOIN USER u1
                       ON enrolled.USER = u1.USER
               INNER JOIN TEST
                       ON TEST.CLASS = enrolled.CLASS
               INNER JOIN takes
                       ON takes.TEST = TEST.TEST
               INNER JOIN USER u2
                       ON takes.USER = u2.USER
                          AND NOT CLASS.USER = u2.USER
        WHERE  u1.USER = :user
        GROUP  BY takes.USER,
                  takes.TEST,
                  enrolled.CLASS) AS d
GROUP  BY TEST;
