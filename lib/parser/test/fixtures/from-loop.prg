PROGRAM from_loop
BEGIN
    FROM i = 0 TO 5
        0
    END

    FROM INT i = 0 TO 5
        0
    END

    FROM i = 0 TO 5 STEP 2
        0
    END

    FROM INT i = 5 TO 0 STEP -1
        0
    END

    FROM INT x = lorem() TO ipsum() STEP something()
    END
END
