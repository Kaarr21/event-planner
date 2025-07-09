#!/usr/bin/env python3
import requests
import json

# Replace with your actual Render URL
BASE_URL = "https://event-planner-12zi.onrender.com"

def test_health():
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    print()

def test_db():
    print("Testing database endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/auth/test-db")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    print()

def test_register():
    print("Testing registration...")
    try:
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    print()

if __name__ == "__main__":
    test_health()
    test_db()
    test_register()
