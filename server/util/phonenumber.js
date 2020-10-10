const E164_REGEX = /\+1[0-9]{10}$/

const isPhoneNumberValid = (phoneNumber) => {
    return !!phoneNumber && E164_REGEX.test(phoneNumber)
}

module.exports = {
    isPhoneNumberValid
}
