SELECT CLASS.CLASS,
       CLASS.enroll_key,
       CLASS.name
FROM   transaction
       INNER JOIN CLASS
               ON CLASS.CLASS = transaction.CLASS
WHERE  transaction.USER = :user;
