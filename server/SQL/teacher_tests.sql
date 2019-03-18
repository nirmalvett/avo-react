SELECT TEST.CLASS,
       TEST.TEST,
       TEST.name,
       TEST.is_open,
       TEST.deadline,
       TEST.timer,
       TEST.attempts,
       TEST.total
FROM   CLASS
       INNER JOIN TEST
               ON TEST.CLASS = CLASS.CLASS
WHERE  CLASS.USER = :user;