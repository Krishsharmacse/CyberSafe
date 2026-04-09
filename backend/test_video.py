import requests
import io

response = requests.post(
    "http://127.0.0.1:8000/api/video",
    files={"file": ("dummy.mp4", b"dummy content", "video/mp4")}
)
print(response.status_code)
print(response.json())
