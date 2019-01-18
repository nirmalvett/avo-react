SELECT CLASS,
       TEST,
       round(AVG(grade) / total * 100, 2) AS average,
       round(STDDEV(grade) / total * 100, 2) AS stdev,
       COUNT(grade) AS student_count
FROM (
  SELECT CLASS.CLASS, TEST.TEST, TEST.total, MAX(takes.grade) AS grade
  FROM CLASS
    INNER JOIN TEST
      ON TEST.CLASS = CLASS.CLASS
    INNER JOIN takes
      ON takes.TEST = TEST.TEST AND NOT takes.USER = CLASS.USER
  WHERE  CLASS.USER = :user
  GROUP  BY takes.USER, takes.TEST
) as DATA
GROUP BY TEST;
