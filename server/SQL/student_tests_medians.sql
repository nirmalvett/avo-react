SELECT mid_grades.CLASS,
       mid_grades.TEST,
       AVG(mid_grades.grade) as median
FROM   (SELECT max_grades.grade AS grade,
               max_grades.CLASS,
               max_grades.TEST,
               IF(@testindex = max_grades.TEST, @rowindex := @rowindex + 1, @rowindex := 0) as rowindex,
               IF(@testindex = max_grades.TEST, @testindex := @testindex, @testindex := max_grades.TEST) as testindex
        FROM   (SELECT CLASS.CLASS,
                       takes.TEST,
                       MAX(takes.grade) AS grade 
                FROM   CLASS 
                       INNER JOIN transaction
                               ON transaction.CLASS = CLASS.CLASS
                       INNER JOIN USER u1 
                               ON transaction.USER = u1.USER
                       INNER JOIN TEST 
                               ON TEST.CLASS = transaction.CLASS
                       INNER JOIN takes 
                               ON takes.TEST = TEST.TEST 
                       INNER JOIN USER u2 
                               ON takes.USER = u2.USER 
                                  AND NOT CLASS.USER = u2.USER
                WHERE  u1.USER = :user
                GROUP  BY takes.USER, 
                          takes.TEST 
                ORDER  BY takes.TEST, 
                          grade) as max_grades) AS mid_grades, (SELECT @rowindex:=0, @testindex:=-1) r
WHERE  mid_grades.rowindex IN ( FLOOR(@rowindex / 2), CEIL(@rowindex / 2) )
GROUP  BY mid_grades.TEST;
