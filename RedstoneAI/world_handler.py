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
    seed_search_radius: int = 10,
    max_blocks: int = 10000,
) -> list[dict]:
    """BFS flood-fill from seed coordinate, returning all connected redstone blocks and their neighbors.

    The seed coordinate does not need to be a redstone block. The nearest redstone block within
    seed_search_radius is used as the starting point. The flood fill travels through redstone blocks
    and also captures non-redstone neighbors of each redstone block found.
    """
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
            block = chunk.get_block(x - (cx << 4), y, z - (cz << 4))
            # Amulet returns universal_minecraft: names internally; normalize to minecraft:
            if block is not None and block.namespaced_name.startswith("universal_minecraft:"):
                from amulet.api.block import Block
                block = Block(
                    "minecraft",
                    block.base_name,
                    block.properties,
                )
            return block
        except Exception:
            return None

    # Find the nearest redstone block within seed_search_radius
    start = None
    for r in range(seed_search_radius + 1):
        if start:
            break
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                for dz in range(-r, r + 1):
                    if max(abs(dx), abs(dy), abs(dz)) != r:
                        continue
                    b = get_block(seed_x + dx, seed_y + dy, seed_z + dz)
                    if b is not None and is_redstone_block(b.namespaced_name):
                        start = (seed_x + dx, seed_y + dy, seed_z + dz)
                        break
                if start:
                    break
            if start:
                break

    if start is None:
        return []

    visited: set[tuple[int, int, int]] = set()
    queue: deque[tuple[int, int, int]] = deque()
    results: list[dict] = []
    captured: set[tuple[int, int, int]] = set()

    queue.append(start)
    visited.add(start)

    while queue and len(results) < max_blocks:
        x, y, z = queue.popleft()
        block = get_block(x, y, z)
        if block is None:
            continue

        name = block.namespaced_name
        if not is_redstone_block(name):
            continue

        # Capture this redstone block
        if (x, y, z) not in captured:
            captured.add((x, y, z))
            properties = {k: str(v) for k, v in block.properties.items()}
            results.append({"x": x, "y": y, "z": z, "name": name, "properties": properties, "is_redstone": True})

        for dx, dy, dz in _NEIGHBOR_OFFSETS:
            nx, ny, nz = x + dx, y + dy, z + dz
            neighbor = get_block(nx, ny, nz)
            if neighbor is None:
                continue
            neighbor_name = neighbor.namespaced_name
            if is_redstone_block(neighbor_name):
                # Queue for flood fill traversal
                if (nx, ny, nz) not in visited:
                    visited.add((nx, ny, nz))
                    queue.append((nx, ny, nz))
            else:
                # Capture as a non-redstone neighbor (once)
                if (nx, ny, nz) not in captured and len(results) < max_blocks:
                    captured.add((nx, ny, nz))
                    properties = {k: str(v) for k, v in neighbor.properties.items()}
                    results.append({"x": nx, "y": ny, "z": nz, "name": neighbor_name, "properties": properties, "is_redstone": False})

    return results
