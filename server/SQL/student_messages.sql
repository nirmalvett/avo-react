SELECT MESSAGE.CLASS,
		MESSAGE.title,
        MESSAGE.body,
        MESSAGE.date_created
FROM 	CLASS
		Inner Join transaction
			ON CLASS.CLASS = transaction.CLASS
		Inner Join MESSAGE
			ON CLASS.CLASS = MESSAGE.CLASS
WHERE transaction.USER = :user
