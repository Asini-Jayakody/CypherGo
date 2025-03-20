from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Dict
import base64
import uuid
import hashlib
from Crypto.Cipher import AES,PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


origins = [
    "http://localhost:3000",
    "localhost:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Key store for AES and RSA keys 
key_store: Dict[str, bytes] = {}

#Cryptographic APIs
class KeyGenRequest(BaseModel):
    key_type: str  # "AES" or "RSA"
    key_size: int  # 256 (AES) or 2048, 4096 (RSA)

class EncryptRequest(BaseModel):
    key_id: str
    plaintext: str
    algorithm: str  # "AES" or "RSA"

class DecryptRequest(BaseModel):
    key_id: str
    ciphertext: str
    algorithm: str  # "AES" or "RSA"

class HashRequest(BaseModel):
    data: str
    algorithm: str

# Hashing
class HashResponse(BaseModel):
    hash_value: str
    algorithm: str


class VerifyRequest(BaseModel):
    data: str
    hash_value: str
    algorithm: str
    
# Supported hashing algorithms
SUPPORTED_ALGORITHMS = {"sha-256", "sha-512", "md5"}

@app.post("/generate-key")
def generate_key(request: KeyGenRequest):
    if request.key_type.upper() == "AES":
        if request.key_size not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Invalid AES key size")
        key = get_random_bytes(request.key_size // 8)  # Convert bits to bytes
        key_id = str(uuid.uuid4())  # Unique ID for key
        key_store[key_id] = {"symmetric_key": key}
        return {"key_id": key_id, "key_value": base64.b64encode(key).decode()}
    
    elif request.key_type.upper() == "RSA":
        if request.key_size not in [1024, 2048, 4096]:
            raise HTTPException(status_code=400, detail="Invalid RSA key size")
        rsa_key = RSA.generate(request.key_size)
        private_key = rsa_key.export_key()
        public_key = rsa_key.publickey().export_key()

        private_key_id = str(uuid.uuid4())  # Unique ID for the private key
        key_store[private_key_id] = {"private_key": private_key}

        public_key_id = str(uuid.uuid4())  # Unique ID for the public key
        key_store[public_key_id] = {"public_key": public_key}
        return {
            "private_key_id": private_key_id,
            "private_key_value": base64.b64encode(private_key).decode(),  
            "public_key_id": public_key_id,
            "public_key_value": base64.b64encode(public_key).decode()
        }
        
    else:
        raise HTTPException(status_code=400, detail="Invalid key type")

@app.post("/encrypt")
def encrypt(request: EncryptRequest):
    if request.key_id not in key_store:
        raise HTTPException(status_code=404, detail="Key not found")

    plaintext_bytes = request.plaintext.encode()

    if request.algorithm.upper() == "AES":
        key = key_store[request.key_id].get("symmetric_key")
        if not key:
            raise HTTPException(status_code=400, detail="Invalid key type for AES")
        
        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext_bytes)
        result = cipher.nonce + tag + ciphertext  # Store nonce, tag, and ciphertext together
    
    elif request.algorithm.upper() == "RSA":
        public_key = key_store[request.key_id].get("public_key")
        if not public_key:
            raise HTTPException(status_code=400, detail="Invalid key type for RSA encryption")
        
        rsa_key = RSA.import_key(public_key)
        cipher = PKCS1_OAEP.new(rsa_key)  # **Use RSA-OAEP padding**
        result = cipher.encrypt(plaintext_bytes)
    else:
        raise HTTPException(status_code=400, detail="Invalid encryption algorithm")

    return {"ciphertext": base64.b64encode(result).decode()}

@app.post("/decrypt")
def decrypt(request: DecryptRequest):
    if request.key_id not in key_store:
        raise HTTPException(status_code=404, detail="Key not found")

    ciphertext_bytes = base64.b64decode(request.ciphertext)

    if request.algorithm.upper() == "AES":
        key = key_store[request.key_id].get("symmetric_key")
        if not key:
            raise HTTPException(status_code=400, detail="Invalid key type for AES")
        nonce, tag, ciphertext = ciphertext_bytes[:16], ciphertext_bytes[16:32], ciphertext_bytes[32:]
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)

    elif request.algorithm.upper() == "RSA":
        private_key = key_store[request.key_id].get("private_key")
        if not private_key:
            raise HTTPException(status_code=400, detail="Invalid key type for RSA decryption")
        rsa_key = RSA.import_key(private_key)
        cipher = PKCS1_OAEP.new(rsa_key)  # **RSA-OAEP decryption**
        plaintext = cipher.decrypt(ciphertext_bytes)
    else:
        raise HTTPException(status_code=400, detail="Invalid decryption algorithm")

    return {"plaintext": plaintext.decode()}

@app.post("/generate-hash", response_model=HashResponse)
async def generate_hash(request: HashRequest):
    algorithm = request.algorithm.lower()

    # Validate the algorithm
    if algorithm not in SUPPORTED_ALGORITHMS:
        raise HTTPException(status_code=400, detail="Unsupported hashing algorithm. Use 'SHA-256', 'SHA-512', or 'MD5'.")
    

    # Compute the hash
    hash_func = hashlib.new(algorithm)
    hash_func.update(request.data.encode("utf-8"))
    hash_bytes = hash_func.digest()

    # Convert to Base64 format
    base64_hash = base64.b64encode(hash_bytes).decode("utf-8")


    return HashResponse(hash_value=base64_hash, algorithm=request.algorithm.upper())

@app.post("/verify-hash")
async def verify_hash(request: VerifyRequest):
    algorithm = request.algorithm.lower()

    if algorithm not in SUPPORTED_ALGORITHMS:
        raise HTTPException(status_code=400, detail="Unsupported hashing algorithm.")

    hash_func = hashlib.new(algorithm)
    hash_func.update(request.data.encode("utf-8"))
    computed_hash = base64.b64encode(hash_func.digest()).decode("utf-8")

    if computed_hash == request.hash_value :
        match = True
        message= "Hash matches the data."
    else:
        match = False
        message = "Hash does not match the data."

    return {"is_valid": match, "message": message}



# Run the API with: uvicorn main:app --reload
