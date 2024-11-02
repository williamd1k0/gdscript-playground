GODOT_BIN := ./bin/linux_release.x86_64
BIN_TARGET := packages/godot/gdscript/godot.bin
VERSION_TARGET := packages/godot/version/godot_version.py

all: ${BIN_TARGET} ${VERSION_TARGET}

${BIN_TARGET}: ${GODOT_BIN}
	rm -f -- $@
	upx -9 -o $@ $<

${VERSION_TARGET}: ${GODOT_BIN}
	printf 'GODOT_VERSION = "%s"' '$(shell $< --version | sed s/.custom_build//)' > $@
