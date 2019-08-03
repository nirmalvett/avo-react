SELECT  CLASS.name,
        MESSAGE.CLASS,
		    MESSAGE.title,
        MESSAGE.body,
        MESSAGE.date_created
FROM 	CLASS
		Inner Join MESSAGE
			ON CLASS.CLASS = MESSAGE.CLASS
WHERE CLASS.USER = :user
ORDER BY MESSAGE.CLASS
