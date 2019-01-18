SELECT TEST.CLASS, TEST.TEST, takes.TAKES, takes.grade, takes.time_submitted
FROM takes
  INNER JOIN TEST ON TEST.TEST = takes.TEST
WHERE takes.USER = :user;
