SELECT TEST.CLASS,
       TEST.TEST,
       TEST.name,
       TEST.is_open,
       TEST.open_time,
       TEST.deadline,
       TEST.timer,
       TEST.attempts,
       TEST.total
FROM   transaction
       INNER JOIN CLASS
               ON CLASS.CLASS = transaction.CLASS
       INNER JOIN TEST
               ON TEST.CLASS = CLASS.CLASS
WHERE  transaction.USER = :user;
