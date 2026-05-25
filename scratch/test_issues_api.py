import requests

tech_id = 2
url = f"https://rcpit-fullstack-1.onrender.com/issues/technician/{tech_id}"
print("Fetching issues for technician ID 2 from Render...")
resp = requests.get(url)
print("Response Status Code:", resp.status_code)
try:
    print("Response Body:", resp.json())
except Exception as e:
    print("Could not parse JSON:", resp.text)
