function generateAsciiTable() {
    let validAscii = []

    for(let i = 48; i <= 57; i++) {
        validAscii.push(i)
    }

    for(let i = 65; i <= 90; i++) {
        validAscii.push(i)
    }

    for(let i = 97; i <= 122; i++) {
        validAscii.push(i)
    }

    return validAscii;
}

export function generateRoomCode() {
    const asciiTable = generateAsciiTable()
    let code = ""

    for(let i = 0; i < 6; i++) {
        code += String.fromCharCode(asciiTable[Math.floor(Math.random() * asciiTable.length)])
    }

    return code;
}