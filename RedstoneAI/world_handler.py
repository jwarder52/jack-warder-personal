import os
import zipfile
from collections import deque
from typing import Any

from amulet.api.errors import ChunkDoesNotExist, ChunkLoadError

from redstone_blocks import is_redstone_block

DIMENSION_Y_BOUNDS: dict[str, tuple[int, int]] = {
    "minecraft:overworld": (-64, 320),
    "minecraft:the_nether": (0, 128),
    "minecraft:the_end": (0, 256),
}

# All 26 neighbor offsets (3x3x3 cube minus center)
_NEIGHBOR_OFFSETS = [
    (dx, dy, dz)
    for dx in (-1, 0, 1)
    for dy in (-1, 0, 1)
    for dz in (-1, 0, 1)
    if (dx, dy, dz) != (0, 0, 0)
]


def extract_world(zip_path: str, extract_dir: str) -> str:
    """Extract a zip file and return the path to the Minecraft world root (contains level.dat)."""
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)

    for root, _dirs, files in os.walk(extract_dir):
        if "level.dat" in files:
            return root

    raise ValueError("No level.dat found in the uploaded zip — not a valid Minecraft world.")


def flood_fill_redstone(
    level: Any,
    dimension: str,
    seed_x: int,
    seed_y: int,
    seed_z: int,
    max_blocks: int = 10000,
) -> list[dict]:
    """BFS flood-fill from seed coordinate, returning all connected redstone blocks."""
    y_min, y_max = DIMENSION_Y_BOUNDS.get(dimension, (-64, 320))

    chunk_cache: dict[tuple[int, int], Any] = {}

    def get_block(x: int, y: int, z: int):
        if y < y_min or y >= y_max:
            return None
        cx, cz = x >> 4, z >> 4
        if (cx, cz) not in chunk_cache:
            try:
                chunk_cache[(cx, cz)] = level.get_chunk(cx, cz, dimension)
            except (ChunkDoesNotExist, ChunkLoadError):
                chunk_cache[(cx, cz)] = None
        chunk = chunk_cache[(cx, cz)]
        if chunk is None:
            return None
        try:
            return chunk.get_block(x - (cx << 4), y, z - (cz << 4))
        except Exception:
            return None

    # Check seed block
    seed_block = get_block(seed_x, seed_y, seed_z)
    if seed_block is None or not is_redstone_block(seed_block.namespaced_name):
        return []

    visited: set[tuple[int, int, int]] = set()
    queue: deque[tuple[int, int, int]] = deque()
    results: list[dict] = []

    queue.append((seed_x, seed_y, seed_z))
    visited.add((seed_x, seed_y, seed_z))

    while queue and len(results) < max_blocks:
        x, y, z = queue.popleft()
        block = get_block(x, y, z)
        if block is None:
            continue

        name = block.namespaced_name
        if not is_redstone_block(name):
            continue

        properties = {k: str(v) for k, v in block.properties.items()}
        results.append({"x": x, "y": y, "z": z, "name": name, "properties": properties})

        for dx, dy, dz in _NEIGHBOR_OFFSETS:
            nx, ny, nz = x + dx, y + dy, z + dz
            if (nx, ny, nz) not in visited:
                visited.add((nx, ny, nz))
                queue.append((nx, ny, nz))

    return results
