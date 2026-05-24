import re
from typing import Optional

from faster_whisper import WhisperModel

import config

_model: Optional[WhisperModel] = None


def initialize() -> None:
    global _model
    print(f"[whisper] Model yükleniyor: {config.WHISPER_MODEL} ({config.WHISPER_DEVICE}/{config.WHISPER_COMPUTE})")
    _model = WhisperModel(
        config.WHISPER_MODEL,
        device=config.WHISPER_DEVICE,
        compute_type=config.WHISPER_COMPUTE,
    )
    print("[whisper] Model hazır")


_PROMPT_PHRASES = ["Toplantı başlıyor.", "Toplantı başlıyor"]

def _strip_prompt(text: str) -> str:
    for phrase in _PROMPT_PHRASES:
        if text.startswith(phrase):
            return text[len(phrase):].strip().lstrip(".")
    return text


def _clean_hallucinations(text: str) -> str:
    text = re.sub(r"\([^)]{1,40}\)", "", text)
    text = re.sub(r"\[[^\]]{1,40}\]", "", text)
    return " ".join(text.split())


def _has_repetition(text: str) -> bool:
    words = text.split()
    if len(words) < 6:
        return False
    max_n = min(7, len(words) // 3 + 1)
    for n in range(1, max_n):
        for i in range(len(words) - n * 3 + 1):
            gram = " ".join(words[i : i + n])
            count = 1
            pos = i + n
            while pos + n <= len(words) and " ".join(words[pos : pos + n]) == gram:
                count += 1
                pos += n
            if count >= 3:
                return True
    return False


def transcribe(audio_path: str, language: Optional[str] = None) -> dict:
    if _model is None:
        raise RuntimeError("Model henüz hazır değil")

    lang = language or config.WHISPER_LANG

    segments_gen, info = _model.transcribe(
        audio_path,
        language=lang,
        task="transcribe",
        beam_size=5,
        temperature=0.0,
        initial_prompt="Toplantı başlıyor.",
        condition_on_previous_text=False,
        no_speech_threshold=0.6,
        compression_ratio_threshold=2.4,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300},
    )
    segments = list(segments_gen)
    raw = " ".join(seg.text.strip() for seg in segments).strip()
    cleaned = _clean_hallucinations(raw)
    cleaned = _strip_prompt(cleaned)

    if _has_repetition(cleaned):
        cleaned = ""

    return {"text": cleaned, "language": info.language}
