#!/usr/bin/env sh
echo GODOT_VERSION=\"v$(./godot_headless.64 --version)\" | tee godot_version.py
