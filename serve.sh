#!/usr/bin/env sh
cd gdscript
chmod +x godot_headless.64
waitress-serve --port=$PORT gdscript.wsgi:application