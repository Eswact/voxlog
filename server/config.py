import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "medium")
WHISPER_LANG = os.getenv("WHISPER_LANG", "tr")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE = os.getenv("WHISPER_COMPUTE", "int8")
