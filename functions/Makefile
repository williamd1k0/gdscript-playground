GODOT_BIN := $(wildcard ./bin/*.64)
BIN_TARGET := packages/godot/gdscript/godot.bin
VERSION_TARGET := packages/godot/version/godot_version.py

all: ${BIN_TARGET} ${VERSION_TARGET}

${BIN_TARGET}: ${GODOT_BIN}
	rm -f -- $@
	upx -9 --best -o $@ $<

${VERSION_TARGET}: ${GODOT_BIN}
	printf 'GODOT_VERSION = "%s"' '$(shell $< --version | sed s/.custom_build//)' > $@
