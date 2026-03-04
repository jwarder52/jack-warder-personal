import amulet
from amulet.api.errors import ChunkLoadError, ChunkDoesNotExist


BLOCKS_PER_CHUNK = 16


def block_to_chunk_coords(block_x: int, block_z: int) -> tuple[int, int]:
    """Translate world block coordinates to chunk coordinates."""
    return block_x // BLOCKS_PER_CHUNK, block_z // BLOCKS_PER_CHUNK

def load_world():
    
    level = amulet.load_level("level")
    
    try:
        chunk = level.get_chunk(0, 0, "minecraft:overworld")
        raw_x, raw_z = input("Enter world block coordinates as 'x z': ").split()
        block_x, block_z = int(raw_x), int(raw_z)
    except ValueError:
        print("Invalid coordinates. Use two integers like '32 -10'.")
        return

    chunk_x, chunk_z = block_to_chunk_coords(block_x, block_z)
    print(
        f"Loading chunk for block ({block_x}, {block_z}) "
        f"-> chunk ({chunk_x}, {chunk_z})"
    )
    
    try:
        chunk = level.get_chunk(chunk_x, chunk_z, "minecraft:overworld")
    except ChunkDoesNotExist:
        print("Chunk does not exist")
    except ChunkLoadError:
        print("Chunk load error")
    else:
        print(chunk)
    
    
    