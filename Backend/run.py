import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        ##192.168.1.42
        port=8000,
        reload=True,
        log_level="info",
    )
