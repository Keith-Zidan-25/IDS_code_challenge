import CryptoJs from 'crypto-js';
import config from './config';

const IV = CryptoJs.enc.Utf8.parse(config.AES_IV);
const KEY = CryptoJs.enc.Utf8.parse(config.AES_Key);

export async function encryptMessage(message: string) {
    const encrypted = CryptoJs.AES.encrypt(message, KEY, {
        iv: IV,
        mode: CryptoJs.mode.CBC,
        padding: CryptoJs.pad.Pkcs7
    });

    return encrypted.toString();
}

export async function decryptMessage(cipher: string) {
    const decrypted = CryptoJs.AES.decrypt(cipher, KEY, {
        iv: IV,
        mode: CryptoJs.mode.CBC,
        padding: CryptoJs.pad.Pkcs7
    });

    return decrypted.toString(CryptoJs.enc.Utf8);
}