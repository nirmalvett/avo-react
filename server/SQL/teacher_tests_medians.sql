SELECT mid_grades.CLASS,
       mid_grades.TEST,
       AVG(mid_grades.grade) AS median
FROM   (SELECT max_grades.grade AS grade,
               max_grades.CLASS,
               max_grades.TEST,
               IF(@testindex = max_grades.TEST, @rowindex := @rowindex + 1, @rowindex := 0) as rowindex,
               IF(@testindex = max_grades.TEST, @testindex := @testindex, @testindex := max_grades.TEST) as testindex
        FROM   (SELECT CLASS.CLASS,
                       takes.TEST,
                       MAX(takes.grade) AS grade
                FROM   CLASS
                       INNER JOIN USER calling_user
                               ON calling_user.USER = CLASS.USER
                       INNER JOIN TEST
                               ON TEST.CLASS = CLASS.CLASS
                       INNER JOIN takes
                               ON takes.TEST = TEST.TEST
                       INNER JOIN USER takes_user
                               ON takes.USER = takes_user.USER
                                  AND NOT CLASS.USER = takes_user.USER
                WHERE  calling_user.USER = :user
                GROUP  BY takes.USER,
                          takes.TEST
                ORDER  BY takes.TEST,
                          grade) as max_grades) AS mid_grades, (SELECT @rowindex := 0, @testindex :=- 1) r
WHERE  mid_grades.rowindex IN ( FLOOR(@rowindex / 2), CEIL(@rowindex / 2) )
GROUP  BY mid_grades.TEST;