import asyncio
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from fastapi import APIRouter, File, Query, UploadFile
from fastapi.responses import JSONResponse

from services import transcription as transcription_service

router = APIRouter()
_executor = ThreadPoolExecutor(max_workers=1)


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    lang: Optional[str] = Query(None),
    session: Optional[str] = Query(None),
):
    suffix = os.path.splitext(audio.filename or "audio.m4a")[1] or ".m4a"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(await audio.read())
        tmp.close()

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            _executor,
            transcription_service.transcribe,
            tmp.name,
            lang,
        )
        return result
    except Exception as exc:
        print(f"[transcribe] {exc}")
        return JSONResponse(status_code=500, content={"error": str(exc)})
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
