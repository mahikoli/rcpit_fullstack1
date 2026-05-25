import requests
import random

# Generate a random email to avoid duplicate errors
rand_num = random.randint(1000, 9999)
email = f"staff_test_{rand_num}@gmail.com"
password = "password123"

# 1. Register Staff
register_url = "https://rcpit-fullstack-1.onrender.com/register"
register_payload = {
    "name": "Test Staff",
    "email": email,
    "mobile": "9999999999",
    "year": "",
    "qualification": "B.E.",
    "lab_name": "Test Lab",
    "room_number": "101",
    "password": password,
    "role": "staff",
    "department": "IT"
}

print(f"Registering staff with email: {email} ...")
reg_resp = requests.post(register_url, json=register_payload)
print("Register response code:", reg_resp.status_code)
print("Register response body:", reg_resp.json())

if reg_resp.status_code == 200:
    # 2. Login
    login_url = "https://rcpit-fullstack-1.onrender.com/login"
    login_payload = {
        "email": email,
        "password": password
    }
    print(f"Logging in with email: {email} ...")
    login_resp = requests.post(login_url, json=login_payload)
    print("Login response code:", login_resp.status_code)
    print("Login response body:", login_resp.json())
