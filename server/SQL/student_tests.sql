SELECT TEST.CLASS,
       TEST.TEST,
       TEST.name,
       TEST.is_open,
       TEST.deadline,
       TEST.timer,
       TEST.attempts,
       TEST.total
FROM   TRANSACTION
       INNER JOIN CLASS
               ON CLASS.CLASS = TRANSACTION.CLASS
       INNER JOIN TEST
               ON TEST.CLASS = CLASS.CLASS
WHERE  TRANSACTION.USER = :user;
