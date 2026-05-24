import io
import os
import wave
from typing import Optional

import av
import numpy as np

_sessions: dict[str, list[str]] = {}

_CROSSFADE_MS = 20


def add_chunk(session_id: str, file_path: str) -> int:
    if session_id not in _sessions:
        _sessions[session_id] = []
    _sessions[session_id].append(file_path)
    return len(_sessions[session_id])


def join_chunks(session_id: str) -> Optional[bytes]:
    chunks = _sessions.pop(session_id, None)
    if not chunks:
        return None
    try:
        return _concat_to_wav(chunks)
    finally:
        _cleanup(chunks)


def _decode_chunk_pcm(chunk_path: str, target_rate: int) -> bytes:
    parts: list[bytes] = []
    with av.open(chunk_path) as container:
        in_stream = container.streams.audio[0]
        resampler = av.AudioResampler(format="s16", layout="mono", rate=target_rate)
        for frame in container.decode(in_stream):
            for rf in resampler.resample(frame):
                parts.append(bytes(rf.planes[0]))
        for rf in resampler.resample(None):
            parts.append(bytes(rf.planes[0]))
    return b"".join(parts)


def _probe_sample_rate(chunk_path: str) -> int:
    with av.open(chunk_path) as container:
        return container.streams.audio[0].sample_rate


def _crossfade_join(pcm_chunks: list[bytes], sample_rate: int) -> bytes:
    if not pcm_chunks:
        return b""
    fade_samples = max(1, int(sample_rate * _CROSSFADE_MS / 1000))
    arrays = [np.frombuffer(c, dtype=np.int16) for c in pcm_chunks if len(c) >= 2]
    if not arrays:
        return b""
    result = arrays[0].astype(np.int32)
    for nxt in arrays[1:]:
        nxt32 = nxt.astype(np.int32)
        n = min(fade_samples, len(result), len(nxt32))
        if n <= 0:
            result = np.concatenate([result, nxt32])
            continue
        fade_out = np.linspace(1.0, 0.0, n, dtype=np.float32)
        fade_in = np.linspace(0.0, 1.0, n, dtype=np.float32)
        tail = result[-n:].astype(np.float32) * fade_out
        head = nxt32[:n].astype(np.float32) * fade_in
        mixed = np.clip(np.round(tail + head), -32768, 32767).astype(np.int32)
        result = np.concatenate([result[:-n], mixed, nxt32[n:]])
    return np.clip(result, -32768, 32767).astype(np.int16).tobytes()


def _concat_to_wav(chunks: list[str]) -> bytes:
    sample_rate = _probe_sample_rate(chunks[0])
    pcm_chunks = [_decode_chunk_pcm(p, sample_rate) for p in chunks]
    pcm_data = _crossfade_join(pcm_chunks, sample_rate)

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_data)

    buf.seek(0)
    return buf.read()


def _cleanup(file_paths: list[str]) -> None:
    for p in file_paths:
        try:
            os.unlink(p)
        except OSError:
            pass
