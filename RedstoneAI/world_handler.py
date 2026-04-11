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

# Functional blocks: non-redstone blocks that are commonly part of redstone builds.
# When captured as neighbors, we search around them for more connected redstone.
FUNCTIONAL_BLOCKS: frozenset[str] = frozenset({
    # Storage / comparator sources
    "minecraft:chest",
    "minecraft:barrel",
    "minecraft:furnace",
    "minecraft:blast_furnace",
    "minecraft:smoker",
    "minecraft:brewing_stand",
    "minecraft:jukebox",
    "minecraft:lectern",
    "minecraft:cauldron",
    "minecraft:water_cauldron",
    "minecraft:lava_cauldron",
    "minecraft:powder_snow_cauldron",
    "minecraft:cake",
    # Beehives — observer/comparator targets in bee farms
    "minecraft:beehive",
    "minecraft:bee_nest",
    # Doors / trapdoors / gates — activated by redstone
    "minecraft:iron_door",
    "minecraft:iron_trapdoor",
    # Beds — sometimes used in farm designs
    "minecraft:white_bed",
    "minecraft:red_bed",
})

# Block name suffixes that are always functional
_FUNCTIONAL_SUFFIXES = (
    "_door",
    "_trapdoor",
    "_fence_gate",
    "_shulker_box",
)

# Directional blocks whose facing property points at a meaningful target
_DIRECTIONAL_BLOCKS = frozenset({
    "minecraft:dispenser",
    "minecraft:dropper",
    "minecraft:observer",
    "minecraft:piston",
    "minecraft:sticky_piston",
    "minecraft:hopper",
})

_FACING_OFFSET: dict[str, tuple[int, int, int]] = {
    "north": (0,  0, -1),
    "south": (0,  0,  1),
    "east":  (1,  0,  0),
    "west":  (-1, 0,  0),
    "up":    (0,  1,  0),
    "down":  (0, -1,  0),
}


def _is_functional(name: str) -> bool:
    if name in FUNCTIONAL_BLOCKS:
        return True
    bare = name.replace("minecraft:", "")
    return any(bare.endswith(s) for s in _FUNCTIONAL_SUFFIXES)


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
    """BFS flood-fill from seed coordinate.

    Accepts any block as seed — redstone, beehive, chest, wire, anything.
    Traverses through redstone blocks (26-directional) and extends through
    functional blocks (beehives, chests, etc.) to find connected redstone on
    the other side. Directional blocks follow their facing to capture targets.
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
            if block is not None and block.namespaced_name.startswith("universal_minecraft:"):
                from amulet.api.block import Block
                block = Block("minecraft", block.base_name, block.properties)
            return block
        except Exception:
            return None

    # Seed search: accept any non-air block within radius as a valid start.
    # Prefer redstone blocks, fall back to any non-air block.
    start = None
    fallback = None
    for r in range(seed_search_radius + 1):
        if start:
            break
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                for dz in range(-r, r + 1):
                    if max(abs(dx), abs(dy), abs(dz)) != r:
                        continue
                    b = get_block(seed_x + dx, seed_y + dy, seed_z + dz)
                    if b is None:
                        continue
                    pos = (seed_x + dx, seed_y + dy, seed_z + dz)
                    if is_redstone_block(b.namespaced_name):
                        start = pos
                        break
                    if fallback is None and b.namespaced_name not in ("minecraft:air", "minecraft:cave_air", "minecraft:void_air"):
                        fallback = pos
                if start:
                    break
            if start:
                break

    # If no redstone found, start BFS from any non-air block and let the
    # functional-extension logic find connected redstone nearby.
    start = start or fallback
    if start is None:
        return []

    visited: set[tuple[int, int, int]] = set()
    queue: deque[tuple[int, int, int]] = deque()
    results: list[dict] = []
    captured: set[tuple[int, int, int]] = set()

    # functional_queue holds non-redstone functional blocks to extend BFS from
    functional_queue: deque[tuple[int, int, int]] = deque()

    def enqueue_redstone(pos: tuple[int, int, int]) -> None:
        if pos not in visited:
            visited.add(pos)
            queue.append(pos)

    def capture_context(nx: int, ny: int, nz: int, name: str, block: Any) -> None:
        if (nx, ny, nz) in captured or len(results) >= max_blocks:
            return
        captured.add((nx, ny, nz))
        properties = {k: str(v) for k, v in block.properties.items()}
        results.append({"x": nx, "y": ny, "z": nz, "name": name, "properties": properties, "is_redstone": False})
        if _is_functional(name):
            functional_queue.append((nx, ny, nz))

    # If the seed is a non-redstone block, capture it and search around it
    seed_block = get_block(*start)
    if seed_block and not is_redstone_block(seed_block.namespaced_name):
        capture_context(start[0], start[1], start[2], seed_block.namespaced_name, seed_block)
        # Bootstrap: search around the seed for redstone to start BFS from
        for dx, dy, dz in _NEIGHBOR_OFFSETS:
            nb = get_block(start[0] + dx, start[1] + dy, start[2] + dz)
            if nb and is_redstone_block(nb.namespaced_name):
                enqueue_redstone((start[0] + dx, start[1] + dy, start[2] + dz))
    else:
        enqueue_redstone(start)

    while (queue or functional_queue) and len(results) < max_blocks:
        # Drain functional_queue: extend BFS around functional context blocks
        while functional_queue:
            fx, fy, fz = functional_queue.popleft()
            for dx, dy, dz in _NEIGHBOR_OFFSETS:
                nb = get_block(fx + dx, fy + dy, fz + dz)
                if nb and is_redstone_block(nb.namespaced_name):
                    enqueue_redstone((fx + dx, fy + dy, fz + dz))

        if not queue:
            break

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

        # Traverse neighbors: queue redstone, capture context
        for dx, dy, dz in _NEIGHBOR_OFFSETS:
            nx, ny, nz = x + dx, y + dy, z + dz
            neighbor = get_block(nx, ny, nz)
            if neighbor is None:
                continue
            neighbor_name = neighbor.namespaced_name
            if is_redstone_block(neighbor_name):
                enqueue_redstone((nx, ny, nz))
            else:
                capture_context(nx, ny, nz, neighbor_name, neighbor)

    # Facing-target pass: follow directional blocks to their target
    for b in list(results):
        if b["name"] not in _DIRECTIONAL_BLOCKS:
            continue
        facing = b["properties"].get("facing")
        if not facing:
            continue
        offset = _FACING_OFFSET.get(facing)
        if not offset:
            continue
        tx, ty, tz = b["x"] + offset[0], b["y"] + offset[1], b["z"] + offset[2]
        if (tx, ty, tz) in captured:
            continue
        target = get_block(tx, ty, tz)
        if target is None:
            continue
        captured.add((tx, ty, tz))
        properties = {k: str(v) for k, v in target.properties.items()}
        results.append({"x": tx, "y": ty, "z": tz, "name": target.namespaced_name, "properties": properties, "is_redstone": False})

    return results
