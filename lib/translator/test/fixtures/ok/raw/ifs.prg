PROGRAM ifs
BEGIN
    BOOL flag = true
    # testing IF with scope
    IF (flag)
        flag
        BOOL flag = false
    END

    IF (false)
        0
    ELSE
        1
    END
END
