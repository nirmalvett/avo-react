SELECT CLASS.CLASS, CLASS.enroll_key, CLASS.name
FROM enrolled
  INNER JOIN CLASS ON CLASS.CLASS = enrolled.CLASS
WHERE enrolled.USER = :user;
