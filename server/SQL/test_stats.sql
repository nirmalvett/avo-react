SELECT max_grades.SECTION,
       max_grades.TEST,
       AVG(max_grades.grade)    AS average,
       STDDEV(max_grades.grade) AS stdev,
       COUNT(max_grades.grade)  AS student_count
FROM   (SELECT user_section.SECTION,
               TEST.TEST,
               MAX(takes.grade) AS grade
        FROM   user_section
               INNER JOIN TEST
                       ON TEST.SECTION = user_section.SECTION
               INNER JOIN takes
                       ON takes.TEST = TEST.TEST
        WHERE  user_section.USER = :user
        GROUP  BY takes.USER,
                  takes.TEST,
                  user_section.SECTION) AS max_grades
GROUP  BY max_grades.TEST;
