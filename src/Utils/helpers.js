import speakeasy from 'speakeasy';

const randomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*&@#';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const generateOTP = (secretBase32) => {
    let token = speakeasy.totp({
        secret: secretBase32, 
        digits: 4,
        step: 60, 
        window: 1
    });
    
    return token;
}



export {
    randomString,
    generateOTP
}