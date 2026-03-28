REDSTONE_BLOCKS: frozenset[str] = frozenset({
    "minecraft:redstone"
    # Wire
    "minecraft:redstone_wire",
    # Repeaters & Comparators
    "minecraft:repeater",
    "minecraft:comparator",
    # Torches
    "minecraft:redstone_torch",
    "minecraft:redstone_wall_torch",
    # Lamps
    "minecraft:redstone_lamp",
    # Blocks of Redstone
    "minecraft:redstone_block",
    # Observers
    "minecraft:observer",
    # Pistons
    "minecraft:piston",
    "minecraft:sticky_piston",
    "minecraft:piston_head",
    "minecraft:moving_piston",
    # Levers
    "minecraft:lever",
    # Buttons
    "minecraft:stone_button",
    "minecraft:oak_button",
    "minecraft:spruce_button",
    "minecraft:birch_button",
    "minecraft:jungle_button",
    "minecraft:acacia_button",
    "minecraft:dark_oak_button",
    "minecraft:mangrove_button",
    "minecraft:cherry_button",
    "minecraft:bamboo_button",
    "minecraft:crimson_button",
    "minecraft:warped_button",
    "minecraft:polished_blackstone_button",
    # Pressure Plates
    "minecraft:stone_pressure_plate",
    "minecraft:oak_pressure_plate",
    "minecraft:spruce_pressure_plate",
    "minecraft:birch_pressure_plate",
    "minecraft:jungle_pressure_plate",
    "minecraft:acacia_pressure_plate",
    "minecraft:dark_oak_pressure_plate",
    "minecraft:mangrove_pressure_plate",
    "minecraft:cherry_pressure_plate",
    "minecraft:bamboo_pressure_plate",
    "minecraft:crimson_pressure_plate",
    "minecraft:warped_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:heavy_weighted_pressure_plate",
    "minecraft:polished_blackstone_pressure_plate",
    # Doors (redstone-activatable)
    "minecraft:iron_door",
    "minecraft:oak_door",
    "minecraft:spruce_door",
    "minecraft:birch_door",
    "minecraft:jungle_door",
    "minecraft:acacia_door",
    "minecraft:dark_oak_door",
    "minecraft:mangrove_door",
    "minecraft:cherry_door",
    "minecraft:bamboo_door",
    "minecraft:crimson_door",
    "minecraft:warped_door",
    # Trapdoors
    "minecraft:iron_trapdoor",
    "minecraft:oak_trapdoor",
    "minecraft:spruce_trapdoor",
    "minecraft:birch_trapdoor",
    "minecraft:jungle_trapdoor",
    "minecraft:acacia_trapdoor",
    "minecraft:dark_oak_trapdoor",
    "minecraft:mangrove_trapdoor",
    "minecraft:cherry_trapdoor",
    "minecraft:bamboo_trapdoor",
    "minecraft:crimson_trapdoor",
    "minecraft:warped_trapdoor",
    # Rails
    "minecraft:rail",
    "minecraft:powered_rail",
    "minecraft:detector_rail",
    "minecraft:activator_rail",
    # Hoppers
    "minecraft:hopper",
    # Droppers & Dispensers
    "minecraft:dropper",
    "minecraft:dispenser",
    # Command blocks (redstone-activatable)
    "minecraft:command_block",
    "minecraft:chain_command_block",
    "minecraft:repeating_command_block",
    # TNT
    "minecraft:tnt",
    # Note blocks
    "minecraft:note_block",
    # Daylight detectors
    "minecraft:daylight_detector",
    # Target blocks
    "minecraft:target",
    # Trapped chests
    "minecraft:trapped_chest",
    # Tripwire
    "minecraft:tripwire",
    "minecraft:tripwire_hook",
    # Sculk sensors
    "minecraft:sculk_sensor",
    "minecraft:calibrated_sculk_sensor",
    # Sculk shrieker (activatable by sculk)
    "minecraft:sculk_shrieker",
    # Fence gates (redstone-activatable)
    "minecraft:oak_fence_gate",
    "minecraft:spruce_fence_gate",
    "minecraft:birch_fence_gate",
    "minecraft:jungle_fence_gate",
    "minecraft:acacia_fence_gate",
    "minecraft:dark_oak_fence_gate",
    "minecraft:mangrove_fence_gate",
    "minecraft:cherry_fence_gate",
    "minecraft:bamboo_fence_gate",
    "minecraft:crimson_fence_gate",
    "minecraft:warped_fence_gate",
})


def is_redstone_block(name: str) -> bool:
    return name in REDSTONE_BLOCKS
