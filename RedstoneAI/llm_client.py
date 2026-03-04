import sys

import anthropic

_SYSTEM_PROMPT = """\
You are an expert Minecraft redstone engineer. You will be given a description of a redstone build \
including a block inventory, per-layer grid visualization, and full JSON block data.

Your task:
1. Analyze the build and describe what it is trying to do.
2. Identify any errors — timing issues, logic mistakes, misconfigured block states (wrong facing, \
wrong delay, wrong mode), missing connections, or blocks that cannot function as intended.
3. For each error, provide a precise fix including the exact coordinates (x, y, z) and the corrected \
block type and/or property values (e.g., `repeater` at (10, 64, 5) should have `delay=2` not `delay=1`).
4. If the build looks correct, confirm it and explain how it works.

Be concise and specific. Use the coordinate system from the data.\
"""


def analyze_redstone(formatted_prompt: str) -> str:
    """Stream the Claude response to stdout and return the full text."""
    client = anthropic.Anthropic()

    full_response: list[str] = []

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": formatted_prompt}],
    ) as stream:
        for chunk in stream.text_stream:
            print(chunk, end="", flush=True)
            full_response.append(chunk)

    print()  # newline after streaming completes
    return "".join(full_response)
