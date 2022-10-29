import os
import stat
import json
from gdscript import GDSCriptCLI


def main(args):
    godot_bin = "./godot.bin"
    st = os.stat(godot_bin)
    os.chmod(godot_bin, st.st_mode | stat.S_IEXEC)
    code = args.get("code")
    if code is not None:
        gds = GDSCriptCLI(godot_bin, json=True, timeout=10)
        output = gds.block(code, sys_exit=False)[0]
        return { "body": json.loads(output) }
    return { "body": "" }
