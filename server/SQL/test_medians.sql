SELECT mid_grades.SECTION,
       mid_grades.TEST,
       AVG(mid_grades.grade) as median
FROM   (SELECT max_grades.grade AS grade,
               max_grades.SECTION,
               max_grades.TEST,
               IF(@test_index = max_grades.TEST, @row_index := @row_index + 1, @row_index := 0) as row_index,
               IF(@test_index = max_grades.TEST, @test_index := @test_index, @test_index := max_grades.TEST) as test_index
        FROM   (SELECT user_section.SECTION,
                       takes.TEST,
                       MAX(takes.grade) AS grade
                FROM   user_section
                       INNER JOIN TEST
                               ON TEST.SECTION = user_section.SECTION
                       INNER JOIN takes
                               ON takes.TEST = TEST.TEST
                WHERE  user_section.USER = :user
                GROUP  BY takes.USER,
                          takes.TEST
                ORDER  BY takes.TEST,
                          grade) as max_grades) AS mid_grades, (SELECT @row_index:=0, @test_index:=-1) r
WHERE  mid_grades.row_index IN ( FLOOR(@row_index / 2), CEIL(@row_index / 2) )
GROUP  BY mid_grades.TEST;
