/*import { JSEncrypt } from "jsencrypt";
import secureLocalStorage from "react-secure-storage";

function encryptMessage(message) {
  let key = secureLocalStorage.getItem("publicKey");
  if (key) {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(key);

    return jsEncrypt.encrypt(message);
  }
  return "";
}

export default encryptMessage;*/

import forge from "node-forge";
import secureLocalStorage from "react-secure-storage";

const encryptMessage = (plainText) => {
  try {
    // Convert the public key string to a Forge public key object

    let publicKey = secureLocalStorage.getItem("publicKey");

    publicKey =
      "-----BEGIN RSA PUBLIC KEY-----" +
      publicKey +
      "-----END RSA PUBLIC KEY-----";
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);

    // Encrypt the plaintext using RSA with OAEP padding
    const encrypted = publicKeyObj.encrypt(plainText, "RSA-OAEP", {
      md: forge.md.sha1.create(),
      mgf1: {
        md: forge.md.sha1.create(),
      },
    });

    // Convert the encrypted data to a Base64 string for display
    const encryptedBase64 = forge.util.encode64(encrypted);

    return encryptedBase64;
  } catch (error) {
    console.error("Encryption error:", error);
  }
};
export default encryptMessage;
