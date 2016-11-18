PROGRAM ifs
BEGIN
    #BOOL flag = true
    # testing IF with scope
    #IF (flag)
    #    flag
    #    BOOL flag = false
    #END

    #IF (false)
    #    0
    #ELSE
    #    1
    #END

    IF (false)
        log("if")
    ELSEIF (false)
        log("1 elseif")
    ELSEIF (true)
        log("2 elseif")
    ELSE
        log("else")
    END
END
