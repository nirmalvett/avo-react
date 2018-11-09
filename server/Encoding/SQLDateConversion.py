
if __name__ == '__main__':
    f = open("SQL.txt", "r")
    w = open("result.txt", "w")
    for x in f:
        print(x)
        found = False
        i = 0
        count = 0
        while count is not 3:
            if x[i] is ',':
                count = count +1
                i = i+1
            else:
                i = i+1
        print(i)
        new_line = x[0:i] + '\'' + x[i:i+4] + '-' + x[i+4:i+6] + '-' + x[i+6:i+8] + ' ' + x[i+8:i+10] + ':' + x[i+10:i+12] + '.'\
            + x[i+12:i+14] + '\'' + x[i+14] + '\'' + x[i+15:i+19] + '-' + x[i+19:i+21] + '-' + x[i+21:i+23] + ' ' + x[i+23:i+25] + ':' + x[i+25:i+27] + '.' + x[i+27:i+29] + '\'' + x[i+29:]
        print(new_line)
        w.write(new_line)
