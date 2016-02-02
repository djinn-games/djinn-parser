PROGRAM ifs
BEGIN
    IF (true) 5 END
    IF (true)
        2 + 2
        5
    END

    IF (false) 5
    ELSE
        2
    END

    IF (false)
    ELSEIF (true)
        2
    END

    IF (false)
    ELSEIF (false)
    ELSEIF (true)
    ELSE
        0
    END
END
