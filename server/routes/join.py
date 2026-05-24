import os
import tempfile

from fastapi import APIRouter, File, Query, UploadFile
from fastapi.responses import JSONResponse, Response

from services import audio as audio_service

router = APIRouter()


@router.post("/join/add")
async def join_add(
    audio: UploadFile = File(...),
    session: str = Query(...),
):
    suffix = os.path.splitext(audio.filename or "audio.m4a")[1] or ".m4a"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(await audio.read())
    tmp.close()

    count = audio_service.add_chunk(session, tmp.name)
    return {"ok": True, "count": count}


@router.get("/join/result")
def join_result(session: str = Query(...)):
    try:
        data = audio_service.join_chunks(session)
        if data is None:
            return JSONResponse(status_code=404, content={"error": "Session bulunamadı veya boş"})
        return Response(
            content=data,
            media_type="audio/wav",
            headers={"Content-Disposition": 'attachment; filename="toplanti.wav"'},
        )
    except Exception as exc:
        print(f"[join] {exc}")
        return JSONResponse(status_code=500, content={"error": str(exc)})
