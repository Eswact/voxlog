from contextlib import asynccontextmanager

import config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.join import router as join_router
from routes.transcribe import router as transcribe_router
from services import transcription as transcription_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    transcription_service.initialize()
    yield


app = FastAPI(title="VoxLog API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(transcribe_router)
app.include_router(join_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=False)
