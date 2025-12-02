from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import os

app = FastAPI()


class FileInfo(BaseModel):
    name: str
    isDirectory: bool
    size: int
    lastModified: float


@app.get("/api/list", response_model=List[FileInfo])
def list_files(path: str = "."):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Path not found")

    if not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path must be a directory")

    result = []
    for name in os.listdir(path):
        full_path = os.path.join(path, name)
        stat = os.stat(full_path)
        result.append(
            FileInfo(
                name=name,
                isDirectory=os.path.isdir(full_path),
                size=stat.st_size,
                lastModified=stat.st_mtime,
            )
        )

    return result


@app.get("/api/file")
def get_file(path: str):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path is a directory")

    return FileResponse(path, filename=os.path.basename(path))
