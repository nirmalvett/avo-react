SELECT CLASS.CLASS,
       CLASS.enroll_key,
       CLASS.name
FROM   CLASS
WHERE  CLASS.USER = :user;