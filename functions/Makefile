GODOT_BIN := $(wildcard ./bin/Godot*.64)
BIN_TARGET := packages/godot/gdscript/godot.bin
VERSION_TARGET := packages/godot/version/godot_version.py

all: ${BIN_TARGET} ${VERSION_TARGET}

${BIN_TARGET}: ${GODOT_BIN}
	ln -f $< $@

${VERSION_TARGET}: ${GODOT_BIN}
	printf 'GODOT_VERSION = "%s"' '$(shell $< --version)' > $@
