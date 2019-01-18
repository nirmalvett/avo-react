SELECT TEST.CLASS,
       TEST.TEST,
       TEST.name,
       TEST.is_open,
       TEST.deadline,
       TEST.timer,
       TEST.attempts,
       TEST.total
FROM   enrolled
       INNER JOIN CLASS
               ON CLASS.CLASS = enrolled.CLASS
       INNER JOIN TEST
               ON TEST.CLASS = CLASS.CLASS
WHERE  enrolled.USER = :user;