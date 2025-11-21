"""
Main entry point for the API.
For backward compatibility, this file imports and exposes the app from app.py.
You can run this with: uvicorn main:app --reload
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
