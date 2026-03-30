import json
import os
import stat

from gdscript import GDSCriptCLI


def main(args):
    godot_bin = "./godot.bin"
    st = os.stat(godot_bin)
    os.chmod(godot_bin, st.st_mode | stat.S_IEXEC)
    code = args.get("code")
    if code is not None:
        gds = GDSCriptCLI(godot_bin, json=True, timeout=10)
        output = gds.block(code, sys_exit=False)[0]
        return {"body": json.loads(output)}
    return {"body": ""}


if __name__ == "__main__":
    import json
    import sys

    args = json.loads(sys.argv[1])
    result = main(args)
    print(json.dumps(result.get("body", "")))
