"""
Isolation test for block detection at specific coordinates.

Usage (as a script):
    python tests/test_block_detection.py <zip_path> <x> <y> <z> [dimension]

    zip_path    — path to a zipped Minecraft world (.zip containing level.dat)
    x, y, z     — integer block coordinates
    dimension   — optional, e.g. minecraft:overworld (default), minecraft:the_nether, minecraft:the_end

Usage (as pytest):
    Configure WORLD_ZIP and COORDS at the top of this file, then run:
    pytest tests/test_block_detection.py -v -s
"""

import sys
import os
import tempfile
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from world_handler import extract_world

# ---------------------------------------------------------------------------
# Configure these for pytest runs
# ---------------------------------------------------------------------------
WORLD_ZIP = r"C:\Users\jward\OneDrive\Desktop\Minecraft ZIP Worlds\world.zip"           # e.g. "C:/Users/jward/worlds/my_world.zip"
COORDS = (206, 105, 118)      # (x, y, z)
DIMENSION = "minecraft:overworld"
# ---------------------------------------------------------------------------


def get_block_at(zip_path: str, x: int, y: int, z: int, dimension: str = "minecraft:overworld"):
    """Extract a world zip and return the block at (x, y, z)."""
    import amulet
    from amulet.api.errors import ChunkDoesNotExist, ChunkLoadError

    with tempfile.TemporaryDirectory() as tmp:
        world_path = extract_world(zip_path, tmp)
        level = amulet.load_level(world_path)
        try:
            cx, cz = x >> 4, z >> 4
            try:
                chunk = level.get_chunk(cx, cz, dimension)
            except (ChunkDoesNotExist, ChunkLoadError) as e:
                raise RuntimeError(f"Chunk ({cx}, {cz}) not found in dimension '{dimension}': {e}")

            block = chunk.get_block(x - (cx << 4), y, z - (cz << 4))
            return block
        finally:
            level.close()


# ---------------------------------------------------------------------------
# pytest test
# ---------------------------------------------------------------------------

@pytest.mark.skipif(not WORLD_ZIP, reason="WORLD_ZIP not configured — set it at the top of this file")
def test_block_at_configured_coords():
    x, y, z = COORDS
    block = get_block_at(WORLD_ZIP, x, y, z, DIMENSION)

    print(f"\nBlock at ({x}, {y}, {z}) in '{DIMENSION}': {block.namespaced_name}")
    if block.properties:
        for k, v in block.properties.items():
            print(f"  {k}: {v}")

    assert block is not None, "Expected a block, got None"
    assert block.namespaced_name, "Block has no namespaced_name"


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)

    zip_path = sys.argv[1]
    x, y, z = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
    dimension = sys.argv[5] if len(sys.argv) > 5 else "minecraft:overworld"

    if not os.path.isfile(zip_path):
        print(f"Error: '{zip_path}' does not exist or is not a file.")
        sys.exit(1)

    print(f"World zip: {zip_path}")
    print(f"Coords:    ({x}, {y}, {z})")
    print(f"Dimension: {dimension}")
    print()

    block = get_block_at(zip_path, x, y, z, dimension)

    print(f"Block: {block.namespaced_name}")
    if block.properties:
        print("Properties:")
        for k, v in block.properties.items():
            print(f"  {k}: {v}")
