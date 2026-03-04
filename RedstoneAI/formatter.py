import json
from collections import Counter

BLOCK_SHORT_CODES: dict[str, str] = {
    "minecraft:redstone_wire": "RW",
    "minecraft:repeater": "RP",
    "minecraft:comparator": "CP",
    "minecraft:observer": "OB",
    "minecraft:piston": "PS",
    "minecraft:sticky_piston": "SP",
    "minecraft:piston_head": "PH",
    "minecraft:moving_piston": "MP",
    "minecraft:redstone_torch": "RT",
    "minecraft:redstone_wall_torch": "RT",
    "minecraft:redstone_lamp": "RL",
    "minecraft:redstone_block": "RB",
    "minecraft:lever": "LV",
    "minecraft:hopper": "HP",
    "minecraft:dropper": "DR",
    "minecraft:dispenser": "DP",
    "minecraft:rail": "RA",
    "minecraft:powered_rail": "PR",
    "minecraft:detector_rail": "DE",
    "minecraft:activator_rail": "AR",
    "minecraft:tnt": "TN",
    "minecraft:note_block": "NB",
    "minecraft:daylight_detector": "DD",
    "minecraft:target": "TG",
    "minecraft:trapped_chest": "TC",
    "minecraft:tripwire": "TW",
    "minecraft:tripwire_hook": "TH",
    "minecraft:sculk_sensor": "SS",
    "minecraft:calibrated_sculk_sensor": "CS",
    "minecraft:sculk_shrieker": "SK",
    "minecraft:command_block": "CB",
    "minecraft:chain_command_block": "CC",
    "minecraft:repeating_command_block": "RC",
    "minecraft:iron_door": "ID",
    "minecraft:iron_trapdoor": "IT",
}

_BUTTON_SUFFIX = "_button"
_PLATE_SUFFIX = "_pressure_plate"
_DOOR_SUFFIX = "_door"
_TRAPDOOR_SUFFIX = "_trapdoor"
_GATE_SUFFIX = "_fence_gate"


def get_short_code(name: str) -> str:
    if name in BLOCK_SHORT_CODES:
        return BLOCK_SHORT_CODES[name]
    bare = name.replace("minecraft:", "")
    if bare.endswith(_BUTTON_SUFFIX):
        return "BT"
    if bare.endswith(_PLATE_SUFFIX):
        return "PP"
    if bare.endswith(_DOOR_SUFFIX):
        return "DO"
    if bare.endswith(_TRAPDOOR_SUFFIX):
        return "TD"
    if bare.endswith(_GATE_SUFFIX):
        return "FG"
    return "??"


def format_for_llm(
    blocks: list[dict],
    user_context: str,
    dimension: str,
    seed_x: int,
    seed_y: int,
    seed_z: int,
) -> str:
    lines: list[str] = []

    lines.append("=== REDSTONE BUILD ANALYSIS REQUEST ===")
    lines.append(
        f"Dimension: {dimension}  Seed: ({seed_x},{seed_y},{seed_z})  Blocks found: {len(blocks)}"
    )
    lines.append(f"User context: {user_context or '(none)'}")
    lines.append("")

    # --- Block inventory ---
    lines.append("=== BLOCK INVENTORY ===")
    counts: Counter = Counter(b["name"] for b in blocks)
    for name, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        bare = name.replace("minecraft:", "")
        lines.append(f"  {bare:<30} x {count:>4}")
    lines.append("")

    # --- Per-layer visualization ---
    lines.append("=== PER-LAYER VISUALIZATION ===")
    if blocks:
        xs = [b["x"] for b in blocks]
        zs = [b["z"] for b in blocks]
        ys = [b["y"] for b in blocks]
        x_min, x_max = min(xs), max(xs)
        z_min, z_max = min(zs), max(zs)
        x_span = x_max - x_min
        z_span = z_max - z_min

        if x_span > 50 or z_span > 50:
            lines.append("  (Grid omitted — build spans >50 blocks in X or Z)")
        else:
            # Build lookup by layer
            by_layer: dict[int, dict[tuple[int, int], str]] = {}
            for b in blocks:
                layer = b["y"]
                by_layer.setdefault(layer, {})[(b["x"], b["z"])] = get_short_code(b["name"])

            x_range = list(range(x_min, x_max + 1))

            for y in sorted(by_layer):
                layer_map = by_layer[y]
                lines.append(f"-- Y={y} --")
                # Header row
                header = "      " + "  ".join(f"{x:>3}" for x in x_range)
                lines.append(header)
                for z in range(z_min, z_max + 1):
                    row_cells = []
                    for x in x_range:
                        code = layer_map.get((x, z), "  ")
                        row_cells.append(f"{code:>3}")
                    lines.append(f"Z={z:<3}: " + "  ".join(row_cells))
                lines.append("")

    # --- Full block data ---
    lines.append("=== FULL BLOCK DATA (JSON) ===")
    truncated = False
    json_blocks = blocks
    if len(blocks) > 2000:
        json_blocks = blocks[:2000]
        truncated = True

    lines.append(json.dumps(json_blocks, separators=(",", ":")))
    if truncated:
        lines.append(f"(Note: JSON truncated to first 2000 of {len(blocks)} blocks)")

    return "\n".join(lines)
