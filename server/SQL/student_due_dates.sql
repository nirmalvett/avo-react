SELECT
		CLASS.name,
		CLASS.CLASS,
        TEST.name,
        TEST.deadline,
        TEST.TEST
FROM	TEST
			INNER JOIN CLASS
				ON CLASS.CLASS = TEST.CLASS
			INNER JOIN  transaction
				ON CLASS.CLASS = transaction.CLASS
WHERE	transaction.USER = 3
