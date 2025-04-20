import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_preview_text_no_file():
    response = client.post("/preview-text", files={})
    assert response.status_code == 422

def test_generate_reply_no_input():
    response = client.post("/generate-reply", data={"tone": "Professional", "strategy": "Standard"})
    assert response.status_code == 200
    assert "No input provided" in response.json()["reply"]

def test_generate_reply_rate_limit():
    for _ in range(6):
        res = client.post("/generate-reply", data={"tone": "Kind", "strategy": "Standard"})
    assert res.status_code == 429

def test_followup_reply_valid():
    res = client.post("/followup-reply", json={"previous": "Hello, thanks!", "prompt": "Make it more formal."})
    assert res.status_code == 200
    assert "reply" in res.json()