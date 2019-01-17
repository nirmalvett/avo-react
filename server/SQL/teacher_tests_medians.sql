SELECT TEST, 
       AVG(g.grade) as median
FROM   (SELECT a.grade AS grade, 
               TEST, 
               IF(@testindex = TEST, @rowindex := @rowindex + 1, @rowindex := 0) as rowindex, 
               IF(@testindex = TEST, @testindex := @testindex, @testindex := TEST) as testindex 
        FROM   (SELECT takes.TEST, 
                       MAX(takes.grade) AS grade 
                FROM   CLASS 
                       INNER JOIN USER u1 
                               ON u1.USER = CLASS.USER
                       INNER JOIN TEST 
                               ON TEST.CLASS = CLASS.CLASS 
                       INNER JOIN takes 
                               ON takes.TEST = TEST.TEST 
                       INNER JOIN USER u2 
                               ON takes.USER = u2.USER 
                                  AND NOT u2.is_teacher = 1 
                WHERE  u1.USER = :user
                GROUP  BY takes.USER, 
                          takes.TEST 
                ORDER  BY takes.TEST, 
                          grade) as a) AS g, (SELECT @rowindex:=0, @testindex:=-1) r
WHERE  g.rowindex IN ( FLOOR(@rowindex / 2), CEIL(@rowindex / 2) ) 
GROUP  BY TEST;