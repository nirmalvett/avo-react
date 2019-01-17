SELECT CLASS.CLASS, TEST.TEST, takes.grade, takes.time_started, takes.time_submitted, takes.TAKES
FROM CLASS
INNER JOIN enrolled ON enrolled.CLASS = CLASS.CLASS
INNER JOIN USER ON enrolled.USER = USER.USER
INNER JOIN TEST ON TEST.CLASS = enrolled.CLASS
INNER JOIN takes ON TEST.TEST = takes.TEST AND takes.USER = USER.USER
WHERE USER.USER = :user;