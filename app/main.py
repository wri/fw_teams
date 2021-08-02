import json
import os

from fastapi import FastAPI, HTTPException

app = FastAPI()

success = {"message": "Hello World from Forest Watcher Teams Service!"}


@app.get("/teams")
def root():
    return success
